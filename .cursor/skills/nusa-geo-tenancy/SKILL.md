---
name: nusa-geo-tenancy
description: >-
  Implement or debug multi-level subdomain tenancy for Nusa.Business
  (nation / island / admin-place hosts, nested area paths, /host fallback,
  Caddy wildcards). Use when touching parseHost, geoNesting, Astro tenant
  pages, DNS, or place aliases.
---

# Geo tenancy skill

## Host grammar

```
nation:  nusa.business | localhost
island:  {island}.nusa.business
admin:   {kabupaten|kota}.{island}.nusa.business
area:    {kabupaten|kota}.{island}.nusa.business/{area}
biz:     {kabupaten|kota}.{island}.nusa.business/{area}/{slug}
         or {kabupaten|kota}.{island}.nusa.business/{slug}
```

`parseHost()` still accepts at most two labels. Nested tourist areas are
**path**, not a third DNS label. `geoNesting()` in `packages/shared/src/geo-urls.ts`
picks the host (parent kabupaten/kota) and optional area slug.

See [ADR-004](../../docs/architecture/adr/004-admin-host-nested-path.md).

## Dev without DNS

Use Astro routes under `apps/web/src/pages/host/[label]/`:

- `/host/bali`
- `/host/gianyar.bali`
- `/host/gianyar.bali/ubud`
- `/host/gianyar.bali/ubud/warung-babi-guling-ibu-oka`

`label` is either `{island}` or `{place}.{island}` (the **administrative**
place when the listing’s place has a parent).

Legacy `/host/ubud.bali/…` 301s to `/host/gianyar.bali/ubud/…`.

## Data model

- `Island` → many `Place`
- `Place.type`: `kabupaten` | `kota` | `tourist_area`
- `parentPlaceId` links tourist area → kabupaten/kota (required for nested URLs)
- `Business.primary` place via `placeId` (usually the most specific place)

## Production DNS

- Apex + `*.nusa.business` + multi-level `*.*.nusa.business` (Cloudflare/Caddy)
- See `docs/ops/dns-and-routing.md`
- Do **not** add `*.*.*.nusa.business` for neighborhoods

## Checklist for tenancy PRs

- [ ] Unknown host soft-fails with island suggestions (or documented 404)
- [ ] Seed includes hybrid places with `parentPlaceId` (e.g. Ubud → Gianyar)
- [ ] Public URL helpers stay consistent (`geoNesting` / `publicUrl` / breadcrumbs)
- [ ] Legacy tourist-area hosts 301 to the parent-host path
- [ ] No reliance on WordPress Multisite domain mapping
