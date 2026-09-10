# ADR-007: Province hosts, complete kabupaten/kota

- **Status:** Accepted
- **Date:** 2026-09-10

## Context

The public nation index listed eight geographic islands, three of them
`coming_soon`. Indonesia’s administrative map is **38 provinces** and **514
kabupaten/kota**. Visitors and field ops think in provinces, not “Java as one
island with four sample cities.”

`parseHost` already stops at two labels: `{place}.{parent}`. The parent slot
was documented as “island.” Bali is both an island and a province, so
`gianyar.bali.nusa.business` stays valid. Java is not a province.

## Decision

The `Island` row is the **province hub**. Host grammar is unchanged:

```text
nusa.business
 └── jawa-timur.nusa.business
      └── surabaya.jawa-timur.nusa.business
 └── bali.nusa.business
      └── gianyar.bali.nusa.business/ubud/{slug}
```

- Seed and production geography include all 38 provinces (all `active`) and
  all 514 kabupaten/kota.
- Geographic island groups (`java`, `sumatra`, `sulawesi`, `kalimantan`) remain
  as `kind: region` hubs that list child provinces. They are not provinces.
- `lombok` canonicalizes to `nusa-tenggara-barat` (NTB is the province).
- `jawa` / `sumatera` keep their existing aliases onto the Java / Sumatra
  **region** hubs.
- Place hosts on a region hub (`yogyakarta.java.nusa.business`) **301** to the
  province host (`yogyakarta.di-yogyakarta.nusa.business`).
- Tourist areas stay `parentPlaceId` path segments (ADR-004).

BPS names/codes in `packages/db/src/indonesia-admin.ts` are adapted from
kode-wilayah-id (MIT).

## Consequences

- Cloudflare needs grey `*.{province}` wildcards for every province slug, plus
  the legacy region slugs while 301s exist (`scripts/lib/place-wildcard-islands.mjs`).
- Existing stores are repaired by migration `2026-09-indonesia-provinces`
  (no re-seed, listings keep their `placeId`).
- Field-agent island dropdown lists provinces only.
