---
name: nusa-platform
description: >-
  Core product and architecture guidance for Nusa.Business — nested geo
  directory, full directory/marketplace capability without WordPress, Astro+portal+Hono stack.
  Use when building features, reviewing PRs, or deciding where code belongs.
---

# Nusa.Business platform skill

## Product

Nusa.Business is an Indonesia-wide **local business directory** with nested hosts:

- `nusa.business` — nation
- `{island}.nusa.business` — island hub (e.g. `bali`)
- `{place}.{island}.nusa.business` — place hub (e.g. `gianyar.bali`)
- `/{slug}` — business listing

Prototype: bali.business (WordPress). Rebuild is greenfield OSS — **do not** add WordPress, PHP plugin stacks, or proprietary themes.

## Stack map

| Concern | Location |
|---|---|
| Host parse / slugs / categories | `packages/shared` |
| Seed + repository | `packages/db` |
| HTTP API | `apps/api` |
| Public SEO pages | `apps/web` (Astro) |
| Auth’d dashboards | `apps/portal` (React Router 7) |
| Compose services | `docker/compose.yml` |

## Rules of change

1. Public read paths stay in Astro; mutations in portal → API.
2. Place taxonomy is **hybrid** (kabupaten/kota + tourist areas).
3. Business slugs are unique **per place**, not globally.
4. Launch monetization: free listings, **0%** marketplace commission unless product changes.
5. Dev path tenants: `/host/{island}` and `/host/{place}.{island}/{slug}` (never `/_host/` — Astro private folders).
6. Update `docs/features-parity.md` when closing capability gaps.

## When unsure

Open or update an ADR under `docs/architecture/adr/` before inventing a second tenancy model or embedding Mercur differently than `docs/mercur-integration.md`.
