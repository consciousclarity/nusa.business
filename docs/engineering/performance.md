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
| HTML `Cache-Control` + `nosniff` | `apps/web/src/middleware.ts` |

Run `npm run build -w @nusa/web` before relying on the built-CSS assertion;
`pretest` does not build the web app.

## Edge compression

Brotli/gzip for HTML and CSS belong on the reverse proxy (Caddy / Cloudflare),
not in the Node process. Confirm on authorized deploy — see
[hermes-vps-notes](../ops/hermes-vps-notes-2026-09-07.md).
