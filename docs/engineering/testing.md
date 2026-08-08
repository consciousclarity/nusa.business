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
| Slugs | `tests/shared.host.test.mjs` | Slugs are URLs, and URLs are permanent once indexed. |
| Auth tokens | `tests/api.auth.test.mjs` | Pins the properties that replaced the forgeable `dev.${id}` scheme: tamper rejection, expiry, and that the old format no longer verifies. |
| Password hashing | `tests/db.password.test.mjs` | Salting, verification, malformed-hash safety, and the legacy-plaintext path that lets an old store still authenticate. |

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

1. **API integration** — Hono routes against a temp store via `NUSA_DATA_DIR`,
   asserting the authorization matrix in [docs/api/auth.md](../api/auth.md)
   rather than only the token primitives.
2. **Smoke e2e** — Playwright over `/host/...` and the portal claim flow.
3. **Repository helpers** — `packages/db` read/write paths, especially the
   whole-file rewrite, which is where concurrent writes will lose data.

## Manual QA

See the [getting-started smoke checklist](../getting-started.md#smoke-checklist)
and the persona journeys in [personas.md](../product/personas.md).
