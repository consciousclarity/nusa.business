# Greptile review rules — Nusa.Business

`AGENTS.md` is the source of truth and Greptile already indexes it. These rules
restate the project **non-negotiables** as blocking review criteria so a diff is
judged against architecture and product constraints, not only style. Flag any PR
that erodes them, even subtly.

## Blocking (P1) — architecture & product constraints

1. **Open source only for first-party code.** Do not approve vendoring Listeo,
   Dokan, or other proprietary/theme code into first-party packages. First-party
   code stays MIT-compatible.
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

## Layering rules

- Host parsing and `toSlug` live in `@nusa/shared` only; do not duplicate host
  logic in apps.
- Persistence belongs in `packages/db`; keep API route handlers thin.
- Public mutations (claim/admin) belong in the portal, not in `apps/web`.

## Security

- Mutating API routes must enforce role checks (owner / field_agent / admin).
- No secrets committed to git; `.env.example` only.
- Prefer dropping root in runtime containers and least-privilege defaults.

## Docs

- When a PR closes a Listeo/Dokan parity gap, `docs/features-parity.md` must be
  updated in the same PR.
