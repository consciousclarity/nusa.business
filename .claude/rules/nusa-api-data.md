---
paths:
  - "apps/api/**"
  - "packages/db/**"
  - "packages/shared/**"
---

# API & data

- Keep route handlers thin; persistence in `packages/db`.
- Host parsing and `toSlug` belong in `@nusa/shared` only.
- JSON repository is the MVP store; Postgres SQL sketch in `schema.sql.ts`.
- Version public routes under `/v1/`.
- CORS must allow local web (4321) and portal (5173).
- When adding entities, update seed data and `docs/data-model.md`.
- Mutating routes enforce role checks via `requireAuth` / `requireRole`. A route
  that writes without one is a blocking defect.
- **Renaming an island or place slug requires a migration** in
  `packages/db/src/migrations.ts`. Seeding only runs when no `store.json`
  exists, so a `seed-data.ts` change never reaches a deployed store — and a
  stale slug makes `/v1/tls-check` reject the host, so Caddy never issues a
  certificate.
- `packages/shared` and `packages/db` compile to `dist/`. Run
  `npm run build:packages` after editing them or the apps and tests use stale code.
