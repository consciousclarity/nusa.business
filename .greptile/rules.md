# Greptile review rules — Nusa.Business

`AGENTS.md` is the source of truth and Greptile already indexes it. These rules
restate the project **non-negotiables** as blocking review criteria so a diff is
judged against architecture and product constraints, not only style. Flag any PR
that erodes them, even subtly.

## Blocking (P1) — architecture & product constraints

1. **Open source only for first-party code.** Do not approve vendoring
   proprietary or commercially licensed theme code into first-party packages.
   First-party code stays MIT-compatible.
2. **Multi-level host tenancy is first-class.** The nested geo host model
   (`nusa.business` → `{island}.nusa.business` → `{place}.{island}.nusa.business`
   → `/{business-slug}`) must not be flattened to a single WordPress-style site
   without an explicit ADR under `docs/architecture/adr/`.
3. **Free listings / 0% commission at launch.** Do not approve changes that
   introduce listing fees or commission unless the PR explicitly changes the
   monetization model with product sign-off.
4. **No WordPress / no Next.js.** The stack is Astro (`apps/web`) + React Router
   portal (`apps/portal`) + Hono (`apps/api`). Flag additions of those
   frameworks.
5. **Dev tenant paths use `/host/{label}`**, never `/_host/...` (Astro treats
   `_`-prefixed folders as private).
6. **Renaming an island or place slug requires a migration entry** in
   `packages/db/src/migrations.ts`. Seeding only runs when no `store.json`
   exists, so a `seed-data.ts` change never reaches a deployed store. Slugs are
   routing keys: a stale one makes `/v1/tls-check` reject the host, so Caddy
   never issues a certificate and the whole branch fails TLS — not just a 404.

## Layering rules

- Host parsing and `toSlug` live in `@nusa/shared` only; do not duplicate host
  logic in apps.
- Persistence belongs in `packages/db`; keep API route handlers thin.
- Public mutations (claim/admin) belong in the portal, not in `apps/web`.

## Security

- Mutating API routes must enforce role checks (owner / field_agent / admin) via
  `requireAuth` / `requireRole`. A route that writes without one is a P1.
- **Identity comes from the verified token, never the request body.** Treat any
  new use of `ownerUserId`, `claimantUserId` or `agentId` read from a payload as
  privilege escalation — an admin is the only caller who may act for someone
  else.
- `NUSA_AUTH_SECRET` is required in production; never commit a default that
  would satisfy the production check.
- **Never expose the dev API port publicly** — the seeded demo accounts have
  passwords published in this repo and `/v1/auth/login` is public by design, so
  a reachable API port hands out an admin token. Browser-side callers go through
  the dev-server proxy in `apps/portal/vite.config.ts`.
- No secrets committed to git; `.env.example` only.
- Prefer dropping root in runtime containers and least-privilege defaults.

## Deploy topology

- The production VPS runs **one shared system-level Caddy** that owns `:80`/
  `:443` for several unrelated sites. Nothing in `docker/compose.prod.yml` may
  bind a public web port — services publish to `127.0.0.1` only, and the host
  Caddy proxies to them. Flag any container that binds `80:` or `443:`.
- `deploy/caddy/nusa.business.caddy` is the source of truth for the host Caddy.
  A second Caddy/nginx config describing a different topology is a trap, not a
  fallback.

## Docs

- When a PR closes a capability gap, `docs/features-parity.md` must be updated
  in the same PR.
