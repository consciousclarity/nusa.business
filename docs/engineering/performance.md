# Public performance

The Astro surface is intentionally thin — see the [teletype performance
budget](../design/teletype.md#performance-budget).

## Gates

| Check | Where |
|---|---|
| No webfonts / `@import` | `tests/web.perf-budget.test.mjs` |
| CSS source / gzip / built size | same |
| No `client:*` islands on public pages | same |
| Single listing form script | same |
| Map library kept out of the eager bundle | same |
| HTML `Cache-Control` + `nosniff` | `apps/web/src/middleware.ts` |

Run `npm run build -w @nusa/web` before relying on the built-CSS assertion;
`pretest` does not build the web app.

## On-demand vendor assets

A library only some readers need does not belong in a route's bundle. MapLibre
GL JS is the working example: it ships ESM-only, ~1.15 MB raw (~300 KB gzip)
across its main bundle, a shared chunk, and a worker script. Importing any of
that from the listing page would put it in the eager payload of every listing
view, which the CSS budget rejects outright and the JS weight would violate
even if it didn't.

Instead `apps/web/scripts/copy-vendor.mjs` (wired to `prebuild`) copies the
published build into `public/vendor/`, and the page injects the stylesheet
`<link>` and dynamically `import()`s the JS when the map is about to scroll
into view. Nothing is vendored into git — `package.json` stays the single
source of the version — and readers who never reach the map never download
any of it. MapLibre's own relative imports (`maplibre-gl.mjs` → `./maplibre-gl-shared.mjs`,
and a module Worker at `./maplibre-gl-worker.mjs`) mean all three JS files
have to ship from the same directory with their filenames unchanged, or the
library breaks at runtime looking for a sibling file that isn't there —
`tests/web.perf-budget.test.mjs` checks all three are present together.

Reach for this when a dependency is (a) big, (b) needed by one route, and (c)
an enhancement rather than the content. Otherwise bundle normally: an asset
served this way is unhashed, so it is cached by path, not by content.

## Edge compression

Brotli/gzip for HTML and CSS belong on the reverse proxy (Caddy / Cloudflare),
not in the Node process. Confirm on authorized deploy — see
[hermes-vps-notes](../ops/hermes-vps-notes-2026-09-07.md).
