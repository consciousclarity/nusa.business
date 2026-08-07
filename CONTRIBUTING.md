# Contributing to Nusa.Business

Thanks for helping build Indonesia’s nested local-business platform.

## Before you start

1. Read [AGENTS.md](../AGENTS.md) and [docs/README.md](../docs/README.md).
2. Skim [docs/features-parity.md](../docs/features-parity.md) so changes map to Listeo/Dokan parity consciously.
3. Use Node 20+ (22 recommended).

## Local setup

```bash
npm install --ignore-scripts
cp .env.example .env
npm run seed
npm run dev:api
npm run dev:web
npm run dev:portal
```

## Branch & PR

1. Branch from `main`: `feat/…`, `fix/…`, `docs/…`.
2. Keep PRs focused; update docs when behavior or architecture changes.
3. Fill the PR template (summary + test plan).
4. CI must pass (package build + app builds).

## Commit style

Prefer short imperative subjects focused on **why**:

- `feat(api): add field-ops bulk photo hook`
- `fix(web): correct place host breadcrumb`
- `docs: document wildcard DNS cutover`

## Code of conduct

Be respectful. No harassment. Assume good intent. This is an open-source project serving Indonesian local businesses and visitors.
