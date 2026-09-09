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

A library only some readers need does not belong in a route's bundle. Leaflet
is the working example: importing it from the listing page put ~148 KB of JS
and its 14.8 KB stylesheet into the eager payload of every listing view, which
the CSS budget rejects.

Instead `apps/web/scripts/copy-vendor.mjs` (wired to `prebuild`) copies the
published build into `public/vendor/`, and the page injects the `<link>` and
`<script>` when the map is about to scroll into view. Nothing is vendored into
git — `package.json` stays the single source of the version — and readers who
never reach the map never download it.

Reach for this when a dependency is (a) big, (b) needed by one route, and (c)
an enhancement rather than the content. Otherwise bundle normally: an asset
served this way is unhashed, so it is cached by path, not by content.

## Edge compression

Brotli/gzip for HTML and CSS belong on the reverse proxy (Caddy / Cloudflare),
not in the Node process. Confirm on authorized deploy — see
[hermes-vps-notes](../ops/hermes-vps-notes-2026-09-07.md).
