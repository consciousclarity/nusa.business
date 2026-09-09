# ADR-004: Administrative host, nested area path

- **Status:** Accepted  
- **Date:** 2026-09-09  

## Context

Hybrid places (ADR-002) mix kabupaten/kota with tourist areas. The first URL
model gave **every** place its own host:

```text
ubud.bali.nusa.business/warung-babi-guling-ibu-oka
```

Ubud is in Gianyar. Visitors and operators think in that containment, and
DNS/TLS stay cheaper if we do **not** mint a host per neighborhood.

`parseHost` stays at most two labels (`{place}.{island}`). Deeper geography
belongs in the path.

## Decision

**Host = administrative parent** (`kabupaten` | `kota`).  
**Path = nested tourist area + listing slug.**

```text
gianyar.bali.nusa.business/ubud/warung-babi-guling-ibu-oka
badung.bali.nusa.business/canggu/old-mans-canggu
denpasar.bali.nusa.business/sanur/{slug}
```

Listings attached directly to a kabupaten/kota stay on the host:

```text
gianyar.bali.nusa.business/babi-guling-pande-egi
```

Helper: `geoNesting()` in `@nusa/shared`. One path segment only — a tourist
area whose parent is another tourist area is **not** encoded in the URL.

Orphan tourist areas (no kabupaten/kota `parentPlaceId`) keep their own host
until a parent is seeded.

Legacy tourist-area hosts **301** to the canonical path:

```text
ubud.bali.nusa.business/{slug}
  → gianyar.bali.nusa.business/ubud/{slug}
```

Dev paths follow the same grammar: `/host/gianyar.bali/ubud/{slug}`.

## Consequences

- Seed must set `parentPlaceId` on tourist areas (Ubud→Gianyar, Canggu→Badung, …)
- Public URL helpers (`publicUrl`, `hostPath`, `tenantHref`) take optional `area`
- Child place slugs win over business slugs at the first path segment
- Fourth DNS label (`menteng.jakarta.java…`) remains out of scope
