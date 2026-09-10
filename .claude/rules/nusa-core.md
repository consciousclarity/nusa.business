# Nusa.Business conventions

- Stack: Astro (`apps/web`) + React Router portal (`apps/portal`) + Hono (`apps/api`). No Next.js, no WordPress.
- Nested geo hosts are sacred: nation → province → kabupaten/kota host → optional area path → business slug.
- Prefer open-source dependencies (MIT/Apache/BSD/GPL). No third-party commercial theme code.
- Launch economics: free listings, 0% commission unless an ADR changes it.
- Update `docs/features-parity.md` when closing capability gaps. Infrastructure
  and security hardening is not tracked there — that belongs in `docs/api/` or
  `docs/ops/`.
- Brainstorms belong in `docs/ideas/` (not only chat); use the `nusa-ideas` skill.
- Dev tenants use `/host/...` paths. Do not create Astro routes under `_` folders.
- Keep secrets out of git; use `.env.example` only.
- Read `AGENTS.md` and the relevant `.claude/skills/*/SKILL.md` before large changes.
