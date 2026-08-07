---
name: nusa-geo-tenancy
description: >-
  Implement or debug multi-level subdomain tenancy for Nusa.Business
  (nation / island / place hosts, /host path fallback, Caddy wildcards).
  Use when touching parseHost, Astro tenant pages, DNS, or place aliases.
---

# Geo tenancy skill

## Host grammar

```
nation:  nusa.business | localhost
island:  {island}.nusa.business
place:   {place}.{island}.nusa.business
biz:     {place}.{island}.nusa.business/{slug}
```

Parser: `parseHost()` in `packages/shared/src/index.ts`.

## Dev without DNS

Use Astro routes under `apps/web/src/pages/host/[label]/`:

- `/host/bali`
- `/host/gianyar.bali`
- `/host/gianyar.bali/babi-guling-pande-egi`

`label` is either `{island}` or `{place}.{island}`.

## Data model

- `Island` → many `Place`
- `Place.type`: `kabupaten` | `kota` | `tourist_area`
- Optional `parentPlaceId` for alias → kabupaten links
- `Business.primary` place via `placeId`

## Production DNS

- Apex + `*.nusa.business` + multi-level `*.*.nusa.business` (Cloudflare/Caddy)
- See `docs/ops/dns-and-routing.md`

## Checklist for tenancy PRs

- [ ] Unknown host soft-fails with island suggestions (or documented 404)
- [ ] Seed includes hybrid places (e.g. Canggu + Gianyar)
- [ ] Public URL helpers stay consistent (`publicUrl` / breadcrumbs)
- [ ] No reliance on WordPress Multisite domain mapping
