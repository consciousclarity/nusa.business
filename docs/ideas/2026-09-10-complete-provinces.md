# Complete 38 provinces and 514 kabupaten/kota

| Field | Value |
|---|---|
| Status | `done` |
| Captured | 2026-09-10 |
| Updated | 2026-09-10 |
| Related | [ADR-007](../architecture/adr/007-province-hosts.md), [geography](../product/geography.md) |

## Problem / itch

The nation homepage listed eight islands, with Kalimantan / Maluku / Papua
stamped coming-soon. Indonesia is 38 provinces and 514 kabupaten/kota.

## Notes from chat

- Host grammar stays two labels: `{kabupaten}.{province}.nusa.business`
- Island row = province; Java/Sumatra/… remain region hubs
- `gianyar.bali/ubud/…` unchanged
- `lombok` → `nusa-tenggara-barat`; `{place}.java` 301s onto the owning province

## Next step

None — shipped in ADR-007 + seed/migration.
