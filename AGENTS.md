# Agent guide — Nusa.Business

Read this before changing code. Detailed docs live in [`docs/`](docs/README.md).

## Product in one line

Indonesia-wide local business directory with nested geo hosts:

`nusa.business` → `{island}.nusa.business` → `{place}.{island}.nusa.business` → `/{business-slug}`

Prototype product: [bali.business](https://bali.business) (WordPress). This repo is a greenfield OSS rebuild — the same **capabilities**, none of the WordPress.

## Stack

| Package | Role |
|---|---|
| `apps/web` | Astro public SEO surface |
| `apps/portal` | React Router 7 owner / field / admin portal |
| `apps/api` | Hono JSON API |
| `packages/shared` | Host parser, slugs, categories |
| `packages/db` | Seed + JSON repository (Postgres schema sketched) |

## Non-negotiables

1. **Open source only** for first-party code (MIT). Do not vendor proprietary or commercially licensed themes.
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

Project skills in [`.cursor/skills/`](.cursor/skills/) — use them for domain workflows (geo tenancy, field ops, capability parity, release).

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

## Cursor Cloud specific instructions

Dependencies are refreshed automatically on VM startup by the update script (`npm install --ignore-scripts` plus `npm run build:packages`). The notes below are the non-obvious things to know when developing here; standard commands live in the `## Commands` section above and in [docs/getting-started.md](docs/getting-started.md).

- **No database, no Docker needed for dev.** Persistence is a JSON file store under `.data/` (override with `NUSA_DATA_DIR`), auto-created from seed data. The Postgres/Redis/Meilisearch/MinIO/Caddy services in `docker/compose.yml` are future/aspirational infra and are **not wired into app code** — do not start them to run or test the product.
- **Three dev services** (run each in its own tmux session): `npm run dev:api` (8787), `npm run dev:web` (4321), `npm run dev:portal` (5173). Both frontends default to the API at `http://localhost:8787`. API health: `http://localhost:8787/health`.
- **`@nusa/shared` and `@nusa/db` are compiled to `dist/` and consumed by the apps.** After editing either package you must rebuild it (`npm run build:packages`) for the API/web/portal to pick up the change — the apps do not hot-reload `packages/*` source. `dev:api` and `dev:portal` rebuild shared on startup, but not on subsequent edits.
- **"Lint"/checks = TypeScript builds.** There is no ESLint config and no automated test suite. CI (`.github/workflows/ci.yml`) only runs `npm run build:packages` then `npm run build -w @nusa/api`, `-w @nusa/portal`, `-w @nusa/web`. Run those to validate changes the way CI does.
- **`apps/api` dev uses `npx --yes tsx@4.19.3`**, which may fetch tsx on the very first run.
- **Demo accounts** (portal at `/login`): `admin@nusa.business`/`admin123`, `agent@nusa.business`/`agent123`, `owner@example.com`/`owner123`.
- **Dev tenant browsing** uses `/host/{label}` paths, e.g. `http://localhost:4321/host/gianyar.bali` (Astro treats `_`-prefixed folders as private, so never use `/_host/...`).
