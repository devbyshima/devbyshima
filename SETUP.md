# devbyshima/devbyshima — setup & dev notes

A website inside an SVG, inside an image, inside markdown, inside a GitHub `README.md`.

The profile `README.md` embeds animated SVGs served by a Cloudflare Worker. A
GitHub Action refetches your contribution graph and redeploys the Worker twice a
day, so the readme stays current on its own.

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
| `scripts/stats.ts`           | Fetches your GitHub contribution calendar → `src/stats.json`. |
| `scripts/preview.ts`         | Renders every section to `dist/*.svg` with mock data.         |
| `.github/workflows/`         | `ci` (typecheck + lint) and `deploy` (stats + redeploy).      |

## First-time setup

### 1. Create the profile repo

The repo **must** be named exactly `devbyshima` (same as your username) for
GitHub to treat its README as your profile.

```bash
cd ~/Dev/devbyshima
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
pnpm start      # wrangler dev — open the printed localhost URL with ?section=main&theme=dark
```

`pnpm start` runs the Worker locally but needs `src/stats.json`. Generate it
first with a token (next step) or just use `pnpm preview` for mock data.

### 3. Fetch your real stats (optional, for local dev)

```bash
echo 'API_TOKEN_GITHUB=ghp_yourPersonalAccessToken' > .env   # classic PAT, no scopes needed for public data
pnpm stats                                                   # writes src/stats.json
```

### 4. Deploy the Worker

```bash
pnpm dlx wrangler login   # authorize wrangler with your Cloudflare account
pnpm deploy               # fetches stats, then deploys
```

Wrangler prints your live URL, e.g.:

```
https://devbyshima.<your-account-subdomain>.workers.dev
```

### 5. Point the README at your real URL

In `README.md`, replace every `https://devbyshima.workers.dev` with the exact
URL wrangler printed, then commit & push:

```bash
git commit -am "Use live worker url"
git push
```

Open https://github.com/devbyshima — it should render. 🎉

### 6. Wire up the auto-redeploy Action

The `deploy` workflow refreshes your graph at 00:00 and 12:00 UTC. Add two
repo secrets (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN` — Cloudflare → My Profile → API Tokens → **Edit
  Cloudflare Workers** template.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare dashboard → Workers & Pages (right sidebar).

`API_TOKEN_GITHUB` is handled automatically by the built-in `GITHUB_TOKEN`.

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
