# The devbyshima Architecture

<https://github.com/devbyshima/devbyshima>

## Introduction

devbyshima is Shima's GitHub profile: the repo named after the account, whose `README.md` GitHub shows on https://github.com/devbyshima. The README holds nothing but `<picture>` and `<img>` tags pointing at a Cloudflare Worker, one per section and color scheme, so the profile is a website inside an SVG, inside an image, inside markdown.

The Worker, `devbyshima` on the devbyshima Cloudflare account, answers each `?section=...&theme=...` request with an animated SVG: HTML and CSS inside a `<foreignObject>`. It reads the account's public contribution graph from GitHub and its committers.top rank in Rwanda, keeps both for an hour, and draws them, so the profile stays current with no scheduled job, redeploy or token.

## What devbyshima is NOT

- devbyshima is not a website. The Worker serves only images; the profile's links go out to shima.sh, X and LinkedIn.
- devbyshima does not use the GitHub API or a token. It reads the same public contribution page a logged-out visitor sees.
- devbyshima is not a service for other accounts. The username and the country are constants in `src/stats.ts` and `src/rank.ts`.
- devbyshima is not for every browser. Firefox does not render the `<foreignObject>` SVGs, so the `fallback` section shows a plain intro there instead.

## Major Components

### The Profile [MARKDOWN]

#### [README.md](README.md)

The profile itself: the `top` bar, the `link-website`, `link-x` and `link-linkedin` buttons (each wrapped in its `<a href>`), `fallback`, `main` and the `rank` tag, each a `<picture>` with a dark `<source>` and a light `<img>` on the Worker's `workers.dev` URL.

### The Worker [CLOUDFLARE WORKER]

TypeScript on Cloudflare Workers, with no runtime dependencies.

#### [src/worker.ts](src/worker.ts)

The `fetch` handler. It reads `section` and `theme`, calls the matching renderer (`top`, `link`, `tag`, `fallback`, or `main` for anything else) and returns `image/svg+xml` with no-cache headers. It also lays out the graph (at most `MAX_YEARS` years, six rows of dots) and exports the `Year` type.

#### [src/render.ts](src/render.ts)

All the SVG and CSS: the `svg` wrapper around a `<foreignObject>`, the `shared` styles (the `--color-*` and animation variables, and the `@-moz-document` rule that hides every section in Firefox), the renderers `main` (the bio, typed out from `BODY_COPY`, over the contribution graph), `top`, `link`, `tag` and `fallback`, and the `Main` type.

#### [src/stats.ts](src/stats.ts)

`getStats` (an in-isolate memo, then `caches.default` under `/__stats`, then GitHub), `fetchStats` (one request per year since `START_DATE`) and `parseCalendar` (the day levels and the yearly total from the calendar HTML), with the `Stats` type.

#### [src/rank.ts](src/rank.ts)

`getRank`, the account's place on committers.top's list for Rwanda, memoized for an hour, with the `Rank` type.

## External Pieces

- **GitHub:** renders the profile README, proxies every image through its Camo cache, and serves the public contribution calendar at `github.com/users/devbyshima/contributions`.
- **committers.top:** the Rwanda list at `committers.top/rank_only/rwanda.json`.
- **Cloudflare Workers:** hosts the Worker on the free `workers.dev` subdomain, with the Cache API for the last good graph.
- **terkelg/terkelg** (MIT): the architecture is adapted from it, as credited in [SETUP.md](SETUP.md).
- **Tooling only:** Wrangler, TypeScript, Prettier and `tsm`, as dev dependencies. No fonts are bundled: the SVGs use the system font stack.

## Tooling

`package.json` scripts, run with pnpm: `pnpm start` (`wrangler dev`, live data), `pnpm preview` (`scripts/preview.ts` renders every section in both themes to `dist/*.svg` from mock data, with no network), `pnpm run deploy` (`wrangler deploy`), `pnpm types` (`tsc --noEmit`), `pnpm lint` (`prettier --check`) and `pnpm format`. [wrangler.toml](wrangler.toml) names the Worker and pins the account. [.github/workflows/ci.yml](.github/workflows/ci.yml) runs `pnpm types` and `pnpm lint` on every push to `main`.

# Workflows

## What does a profile view look like?

1. GitHub renders `README.md`, and the browser picks the light or dark `<source>` of each `<picture>`. GitHub fetches every image through Camo.
2. For `section=main` or `top`, `src/worker.ts` calls `getStats`, which returns the memo or the cached copy while it is under an hour old, and otherwise asks GitHub through `fetchStats` and caches the result, falling back to the last good copy if GitHub fails. For `section=rank`, it calls `getRank` the same way.
3. The renderer builds the SVG, and the Worker returns it with no-cache headers.

## What does the Development flow look like?

`pnpm install`, then `pnpm preview` to look at every section with mock data, or `pnpm start` to run the Worker locally against GitHub. `pnpm types` and `pnpm lint` before pushing; CI runs the same two. The steps, and where to change the bio, colors, links and timing, are in [SETUP.md](SETUP.md).

## What does the Release flow look like?

Nothing deploys automatically. After a change under `src/`, `pnpm run deploy`, logged in to the devbyshima Cloudflare account; a change to `README.md` goes live when it is pushed to `main`. The contribution graph needs neither: it refreshes on its own within an hour.

# Invariants

Things the code relies on that are easy to break:

- **The repo name** must stay `devbyshima`, the same as the username, or GitHub stops showing the README as the profile.
- **Sections:** a section's name lives in two places, the README's `?section=` URLs and the branches in `src/worker.ts`. A new link means a new `<a href>` and `section` in the README and a matching `link-*` branch in the Worker.
- **The graph** comes from scraping GitHub's public calendar HTML (`data-date` and `data-level`, and the "contributions in" total), so a change to that page breaks `parseCalendar`. `START_DATE` is the account's creation date; nothing before it is fetched.
- **Stale over broken:** when GitHub or committers.top cannot be reached, the last good copy is served instead of an error.
- **Firefox:** `shared` hides every section under `@-moz-document`, and only `link`, `tag` and `fallback` override it to show there. `fallback` stands in for `main`, `top` stays hidden, and a new section is hidden in Firefox too unless it overrides the rule.
- **The account:** `wrangler.toml` pins `account_id`, so a deploy while logged in to another Cloudflare account fails instead of landing there.
- **`pnpm run deploy`**, never `pnpm deploy`, which is a different, built-in pnpm command.

## License

devbyshima is released under the [MIT License](license).
