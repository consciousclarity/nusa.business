# Monorepo layout

```text
nusa.business/
  apps/
    api/          Hono API
    web/          Astro public site
    portal/       React Router portal
  packages/
    shared/       Host parser, slugs, categories
    db/           Types, seed, repository, SQL sketch
  docker/         Compose + Caddyfile
  docs/           Product & engineering docs
  .cursor/
    skills/       Agent skills
    rules/        Cursor rules
  .github/        CI, templates, CODEOWNERS
```

## Workspace scripts

| Script | Action |
|---|---|
| `npm run build:packages` | Build shared + db |
| `npm run seed` | Reset `.data/store.json` |
| `npm run dev:api` | API on :8787 |
| `npm run dev:web` | Astro on :4321 |
| `npm run dev:portal` | Portal on :5173 |
| `npm run docker:up` | Supporting services |

## Dependency rule

App code depends inward: `apps/*` → `packages/*`. Packages must not import apps.
