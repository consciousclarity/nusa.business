# Going deeper than place.island hosts

| Field | Value |
|---|---|
| Status | `done` |
| Captured | 2026-09-08 |
| Updated | 2026-09-09 |
| Related | [ADR-004](../architecture/adr/004-admin-host-nested-path.md), [ADR-002 hybrid places](../architecture/adr/002-hybrid-places.md), [geography](../product/geography.md), [tenancy](../architecture/tenancy.md) |

## Problem / itch

Host depth stops at `{place}.{island}.nusa.business`. Owner wants listings in a
tourist area to sit **under the kabupaten** in the path, because Ubud is in
Gianyar:

```text
ubud.bali.nusa.business/warung-babi-guling-ibu-oka
  → gianyar.bali.nusa.business/ubud/warung-babi-guling-ibu-oka
```

## Decision (promoted)

**Host = kabupaten/kota. Nested tourist area = one path segment.** `parseHost`
unchanged (at most two labels). `geoNesting()` is the global rule.

Fourth DNS label (`menteng.jakarta.java.nusa.business`) stays parked.

## Notes from chat (2026-09-09)

- Global, not Bali-only: Sanur under Denpasar, Canggu under Badung, Menteng
  would be `jakarta.java.nusa.business/menteng/{slug}` once seeded.
- Listings on the kabupaten itself stay `{gianyar}.bali…/{slug}`.
- Legacy tourist-area hosts 301 to the parent-host path.
