# Agent guide — Nusa.Business

Read this before changing code. Detailed docs live in [`docs/`](docs/README.md).

## Product in one line

Indonesia-wide local business directory with nested geo hosts:

`nusa.business` → `{island}.nusa.business` → `{place}.{island}.nusa.business` → `/{business-slug}`

Prototype product: [bali.business](https://bali.business) (Listeo/WordPress). This repo is a greenfield OSS rebuild (Listeo + Dokan *capability* parity — no WordPress).

## Stack

| Package | Role |
|---|---|
| `apps/web` | Astro public SEO surface |
| `apps/portal` | React Router 7 owner / field / admin portal |
| `apps/api` | Hono JSON API |
| `packages/shared` | Host parser, slugs, categories |
| `packages/db` | Seed + JSON repository (Postgres schema sketched) |

## Non-negotiables

1. **Open source only** for first-party code (MIT). Do not vendor Listeo or proprietary themes.
2. **Multi-level host tenancy** is a first-class design constraint — never flatten to a single WP-style site without an explicit ADR.
3. **Free listings / 0% commission at launch** unless product explicitly changes monetization.
4. Prefer **Astro for public pages** and **portal for authenticated mutations**.
5. Dev tenant paths use `/host/{label}` (not `/_host/…` — Astro treats `_` folders as private).

## Where to change what

| Task | Start here |
|---|---|
| Host / slug rules | `packages/shared/src/index.ts` |
| Seed businesses / places | `packages/db/src/seed-data.ts` |
| API routes | `apps/api/src/index.ts` |
| Public pages | `apps/web/src/pages/` |
| Portal UX | `apps/portal/src/pages/` |
| Parity checklist | `docs/features-parity.md` |
| Architecture decisions | `docs/architecture/` |

## Skills

Project skills in [`.cursor/skills/`](.cursor/skills/) — use them for domain workflows (geo tenancy, field ops, Listeo/Dokan parity, release).

## Commands

```bash
npm install --ignore-scripts
npm run seed
npm run dev:api
npm run dev:web
npm run dev:portal
```

## Docs entry

Start at [docs/README.md](docs/README.md).
