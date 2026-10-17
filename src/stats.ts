import type { Year } from './worker.js';

const USERNAME = 'devbyshima';

// devbyshima's account was created 2025-11-19, so no contributions exist before this.
const START_DATE = '2025-11-19';

// How long a fetched graph is reused before asking GitHub again.
const FRESH_FOR_MS = 60 * 60 * 1000;

// How long Cloudflare keeps the last good graph around, so a GitHub outage
// keeps serving slightly old data instead of a broken image.
const KEEP_STALE_FOR_S = 7 * 24 * 60 * 60;

export type Stats = {
  years: Year[];
  contributions: number;
};

type Cached = {
  fetchedAt: number;
  stats: Stats;
};

/**
 * Read one year of GitHub's public contribution calendar (the HTML behind the
 * graph on a profile page). Returns the levels (0-4) for every day between
 * `from` and `to` inclusive, most recent first, and that year's total.
 * Dates are YYYY-MM-DD.
 */
export function parseCalendar(html: string, from: string, to: string) {
  const days: [date: string, level: number][] = [];
  for (const match of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="(\d)"/g)) {
    const [, date, level] = match;
    if (date >= from && date <= to) days.push([date, Number(level)]);
  }
  // The calendar is laid out row by row (one row per weekday), so sort by date.
  days.sort((a, b) => (a[0] < b[0] ? 1 : -1));

  const total = html.match(/([\d,]+)\s+contributions?\s+in\s+\d{4}/);
  return {
    days: days.map(([, level]) => level),
    contributions: total ? Number(total[1].replace(/,/g, '')) : 0
  };
}

/**
 * Fetch every year since START_DATE from GitHub, most recent year first.
 * Needs no token: it reads the same public page a logged-out visitor sees.
 */
export async function fetchStats(now = new Date()): Promise<Stats> {
  const today = now.toISOString().slice(0, 10);
  const startYear = Number(START_DATE.slice(0, 4));
  const currentYear = now.getUTCFullYear();

  const yearsToFetch: number[] = [];
  for (let year = currentYear; year >= startYear; year--) yearsToFetch.push(year);

  const results = await Promise.all(
    yearsToFetch.map(async (year) => {
      const url = `https://github.com/users/${USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`;
      const response = await fetch(url, {
        headers: { 'user-agent': `${USERNAME}-readme (+https://github.com/${USERNAME})` }
      });
      if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${year}`);

      const from = year === startYear ? START_DATE : `${year}-01-01`;
      const to = year === currentYear ? today : `${year}-12-31`;
      const { days, contributions } = parseCalendar(await response.text(), from, to);
      if (days.length === 0) throw new Error(`No contribution days found for ${year}`);

      const until = year === currentYear ? now.toISOString() : `${year + 1}-01-01T00:00:00.000Z`;
      return { year: { from: `${from}T00:00:00.000Z`, to: until, days }, contributions };
    })
  );

  return {
    years: results.map((result) => result.year),
    contributions: results.reduce((sum, result) => sum + result.contributions, 0)
  };
}

// Reused within one isolate so most requests skip even the cache lookup.
let memo: Cached | undefined;

/**
 * Live contribution stats, cached for an hour. If GitHub can't be reached,
 * the last good copy is served instead.
 */
export async function getStats(request: Request, ctx: ExecutionContext): Promise<Stats> {
  if (memo && Date.now() - memo.fetchedAt < FRESH_FOR_MS) return memo.stats;

  const cache = caches.default;
  const key = new URL('/__stats', request.url).toString();
  const hit = await cache.match(key);
  const stale = hit ? ((await hit.json()) as Cached) : memo;
  if (stale && Date.now() - stale.fetchedAt < FRESH_FOR_MS) {
    memo = stale;
    return stale.stats;
  }

  try {
    memo = { fetchedAt: Date.now(), stats: await fetchStats() };
    const body = JSON.stringify(memo);
    ctx.waitUntil(
      cache.put(
        key,
        new Response(body, {
          headers: {
            'content-type': 'application/json',
            'cache-control': `max-age=${KEEP_STALE_FOR_S}`
          }
        })
      )
    );
    return memo.stats;
  } catch (error) {
    if (stale) return stale.stats;
    throw error;
  }
}
