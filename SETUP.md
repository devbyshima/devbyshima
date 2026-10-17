# devbyshima/devbyshima — setup & dev notes

A website inside an SVG, inside an image, inside markdown, inside a GitHub `README.md`.

The profile `README.md` embeds animated SVGs served by a Cloudflare Worker on
the **devbyshima** Cloudflare account. The Worker reads your public contribution
graph from GitHub itself and caches it for an hour, so the readme stays current
with no scheduled job, redeploy or token.

> [!WARNING]
> This is experimental. GitHub renders the `<foreignObject>` SVGs in
> Chromium/WebKit but **not** in Firefox — which is why there's a separate
> `fallback` section just for Firefox users.

Credit: architecture adapted from [terkelg/terkelg](https://github.com/terkelg/terkelg) (MIT).

## What's where

| File                         | Purpose                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| `README.md`                  | The profile itself — just `<img>`s pointing at the Worker.    |
| `src/worker.ts`              | Cloudflare Worker; routes `?section=…&theme=…` to a renderer. |
| `src/render.ts`              | All the SVG + CSS. Edit your bio, colors, animations here.    |
| `src/stats.ts`               | Fetches and caches your public contribution calendar.         |
| `scripts/preview.ts`         | Renders every section to `dist/*.svg` with mock data.         |
| `.github/workflows/ci.yml`   | Typecheck + lint on every push.                               |

## First-time setup

### 1. Create the profile repo

The repo **must** be named exactly `devbyshima` (same as your username) for
GitHub to treat its README as your profile.

```bash
cd ~/Dev/shima/sites/devbyshima
git init -b main
git add .
git commit -m "Animated profile readme"
gh repo create devbyshima --public --source=. --remote=origin --push
```

### 2. Install & sanity-check locally

```bash
pnpm install
pnpm types      # typecheck
pnpm lint       # prettier check
pnpm preview    # writes dist/*.svg you can open in a browser
pnpm start      # wrangler dev; open the printed localhost URL with ?section=main&theme=dark
```

`pnpm start` runs the Worker locally with live data from GitHub, same as
production. `pnpm preview` uses mock data and needs no network.

### 3. Deploy the Worker

```bash
pnpm dlx wrangler login   # pick the devbyshima Cloudflare account
pnpm run deploy           # `pnpm deploy` is a different, built-in pnpm command
```

Wrangler prints your live URL, e.g.:

```
https://devbyshima.<your-account-subdomain>.workers.dev
```

### 4. Point the README at your real URL

In `README.md`, replace every `https://devbyshima.workers.dev` with the exact
URL wrangler printed, then commit & push:

```bash
git commit -am "Use live worker url"
git push
```

Open https://github.com/devbyshima — it should render. 🎉

### Deploying changes

Nothing deploys automatically. After changing `src/`, run `pnpm run deploy`
(logged in to the devbyshima account). The contribution graph needs no deploy:
it refreshes on its own within an hour.

## Customizing

- **Bio** → `BODY_COPY` in `src/render.ts`.
- **Colors** → the `--color-*` variables at the top of `shared` in `src/render.ts`.
- **Links** → edit the `<a href>`s in `README.md` and the matching
  `section === 'link-*'` branches in `src/worker.ts`.
- **Animation timing** → the `--animate-in-*` / `--default-*` variables in `shared`.

## Tips & tricks

GitHub caches images through its Camo proxy. To force-refresh one after a
redeploy:

```bash
curl -w "\n" -s -X PURGE https://camo.githubusercontent.com/<hash>
```
