# Feature parity — Listeo + Dokan → Nusa.Business

Status key: **done** in this greenfield MVP · **partial** · **planned**

## Listeo → Nusa Directory

| Capability | Status | Where |
|---|---|---|
| Listings + categories | done | `packages/db`, API `/v1/...`, Astro pages |
| Geo regions as first-class places | done | Island / Place model + host parser |
| Nested hosts `place.island.nusa.business` | done | `@nusa/shared` `parseHost` + `/host/` dev routes |
| Search / filters | partial | API `/v1/search` (Meilisearch wired in Docker, not yet indexed) |
| Map search | planned | MapLibre + PostGIS (schema outlined) |
| Claim listing | done | Portal `/claim` + API `/v1/claims` |
| Multi-criteria reviews | done | service/value/location/cleanliness on listing + API |
| Owner dashboard | done | Portal listings CRUD |
| Opening hours / gallery / FAQ fields | partial | Hours seeded; gallery/FAQ schema present |
| Booking: service / rental / event | done | Listing `bookingMode` + public form + `/v1/.../bookings` |
| Paid packages | planned | Model later; launch is free like bali.business |
| Private messages | planned | Phase 6 |
| Bookmarks | planned | Phase 6 |
| i18n en/id | partial | English UI; id routes next |
| AI local guide | planned | Optional |

## Dokan → Nusa Marketplace

| Capability | Status | Where |
|---|---|---|
| Vendor store per business | done (local module) | `/v1/marketplace/vendors` + listing Shop tab |
| Products on store | done | Seeded vendor products |
| Vendor dashboard | partial | Portal `/vendor` create/load |
| Multi-vendor cart/checkout | planned | Mercur/Medusa (compose stub commented) |
| Commissions / payouts | partial | `commissionPercent` default **0%** |
| Mercur vendor UUID link | planned | `VendorLink` / mercur notes on vendor payload |

## bali.business migration / 301

See [migration-bali.md](./migration-bali.md).

## Demo accounts

| Email | Password | Role |
|---|---|---|
| admin@nusa.business | admin123 | admin |
| agent@nusa.business | agent123 | field_agent |
| owner@example.com | owner123 | owner |
