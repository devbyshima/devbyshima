const USERNAME = 'devbyshima';
const COUNTRY = { slug: 'rwanda', title: 'Rwanda' };

// committers.top regenerates its lists every few days, so an hour is plenty.
const FRESH_FOR_MS = 60 * 60 * 1000;

export type Rank = {
  country: string;
  /** 1-based place on the list, 0 when unranked, undefined when unknown. */
  position?: number;
};

type RankOnly = {
  title: string;
  user: string[];
};

// Reused within one isolate so most requests skip the fetch.
let memo: { fetchedAt: number; rank: Rank } | undefined;

/**
 * devbyshima's place on committers.top's public commits list for Rwanda, the
 * same list its own badges use. Cached for an hour. If committers.top can't be
 * reached, the last good copy is served, or just the country when there is none.
 */
export async function getRank(): Promise<Rank> {
  if (memo && Date.now() - memo.fetchedAt < FRESH_FOR_MS) return memo.rank;

  try {
    const response = await fetch(`https://committers.top/rank_only/${COUNTRY.slug}.json`, {
      cf: { cacheTtl: FRESH_FOR_MS / 1000, cacheEverything: true }
    });
    if (!response.ok) throw new Error(`committers.top returned ${response.status}`);

    const { title, user } = (await response.json()) as RankOnly;
    const login = USERNAME.toLowerCase();
    const position = user.findIndex((name) => name.toLowerCase() === login) + 1;
    memo = { fetchedAt: Date.now(), rank: { country: title, position } };
    return memo.rank;
  } catch {
    return memo?.rank ?? { country: COUNTRY.title };
  }
}
