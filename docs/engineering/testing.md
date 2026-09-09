# Testing

## Running the suite

```bash
npm test
```

`pretest` builds `@nusa/shared`, `@nusa/db` and `@nusa/api` first, so the command
is self-sufficient. CI runs it on every PR alongside the app builds.

Tests live in `tests/` and use the **Node built-in test runner** — no test
framework dependency, nothing to keep up to date, and no `package-lock` churn.
Files are `.mjs` and import the **built** packages (`@nusa/shared`, `@nusa/db`,
`apps/api/dist`), so what is under test is what actually ships.

## What is covered today

| Area | File | Why it matters |
|---|---|---|
| Host parsing | `tests/shared.host.test.mjs` | `parseHost()` turns a Host header into the geo context every surface renders from. If it drifts, tenancy silently breaks. Pins the "at most `place.island`" rule and rejects lookalike domains. |
| Category taxonomy | `tests/shared.taxonomy.test.mjs` | Two-level Indonesia catalog: unique slugs, Events related pointers (no duplicate leaves), legacy label canonicalization, group filter expansion. |
| Directory facets | `tests/shared.facets.test.mjs`, `tests/db.facets.test.mjs`, `tests/api.search-facets.test.mjs`, `tests/web.facet-browse.test.mjs` | Allowlisted `/c/{category}/{facet}/{value}` index policy; listing match; seed filters; search query params; robots/canonical wiring. |
| Geo nesting | `tests/shared.geo-nesting.test.mjs`, `tests/db.geo-nesting.test.mjs` | Tourist areas nest under kabupaten/kota hosts (`gianyar.bali/ubud/{slug}`). Pins `geoNesting` + seed `parentPlaceId`. |
| Slugs | `tests/shared.host.test.mjs` | Slugs are URLs, and URLs are permanent once indexed. |
| Auth tokens | `tests/api.auth.test.mjs` | Pins the properties that replaced the forgeable `dev.${id}` scheme: tamper rejection, expiry, and that the old format no longer verifies. |
| Password hashing | `tests/db.password.test.mjs` | Salting, verification, malformed-hash safety, and the legacy-plaintext path that lets an old store still authenticate. |
| Write validation | `tests/api.validate.test.mjs` | Runtime schemas for reviews, booking requests, and listing PATCH allowlists — TypeScript types are not enough. |
| Onboarding / claims | `tests/api.onboarding-claims.test.mjs` | Invite register, safe returnTo, duplicate pending claims, audited decisions, recovery tokens. |
| Authz / CORS | `tests/api.authz-cors.test.mjs`, `tests/shared.cors-origins.test.mjs` | Origin allowlist (no reflect-any); role matrix for listings, bookings, invites, claim decide. |
| API origins | `tests/shared.api-origins.test.mjs` | Browser origins must be public HTTPS in production; SSR may use Compose-internal URLs; `http://api:8787` is rejected for browsers. |
| Locale paths | `tests/shared.locale.test.mjs` | `/id` prefix detect/strip/`withLocale` for public bilingual routes. |
| Contact links | `tests/shared.contact-links.test.mjs` | WhatsApp `wa.me` and `tel:` normalisation for Indonesian numbers. |
| Geo helpers | `tests/shared.geo.test.mjs` | Address normalisation + haversine for listing discovery. |
| Listing discovery | `tests/db.discovery.test.mjs` | Same-address peers, similar ≤2 km, category nearby filter. |
| Production bootstrap | `tests/db.bootstrap.test.mjs` | Production missing store refuses demo seed; bootstrap admin creates geography-only store; existing stores are preserved. |
| JSON durability | `tests/db.persist.test.mjs` | Atomic write + `.bak` rotation; recover truncated `store.json`; refuse silent re-seed when both files are corrupt. |
| Public privacy | `tests/api.public-privacy.test.mjs` | Anonymous listing/search responses omit bookings, review emails, and ownership internals; drafts 404; owners cannot read each other's bookings. |
| Public a11y chrome | `tests/web.a11y-chrome.test.mjs` | Skip link, crumb semantics, AA label colour, review fieldset, booking `aria-*` wiring. |
| Public SEO helpers | `tests/web.seo.test.mjs` | Canonical origin, `/host` paths, LocalBusiness JSON-LD, sitemap XML escaping. |
| Public perf budget | `tests/web.perf-budget.test.mjs` | No webfonts/islands; CSS size ceilings; HTML cache headers. See [performance.md](./performance.md). |
| Listing coord backfill | `tests/scripts.backfill-listing-coords.test.mjs` | Standalone VPS script fills missing `lat`/`lng` from seed / place centroids without re-seeding. |

## Adding a test

Add `tests/<area>.<subject>.test.mjs` and import from the package rather than
reaching into `src/`:

```js
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseHost } from "@nusa/shared";
```

If a module reads environment variables at import time (as `apps/api/dist/auth.js`
does with `NUSA_AUTH_SECRET`), set them **before** a dynamic `await import(...)`.

## Still to build

1. **API authorization matrix (remaining)** — broaden beyond C01 privacy/booking
   isolation to cover claims, listing PATCH, and forged tokens end-to-end
   ([docs/api/auth.md](../api/auth.md)).
2. **Smoke e2e** — Playwright over `/host/...` and the portal claim flow.
3. **Repository helpers** — `packages/db` read/write paths, especially the
   whole-file rewrite, which is where concurrent writes will lose data.

## Manual QA

See the [getting-started smoke checklist](../getting-started.md#smoke-checklist)
and the persona journeys in [personas.md](../product/personas.md).
