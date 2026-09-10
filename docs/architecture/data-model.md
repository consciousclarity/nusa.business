# Data model

MVP persistence: JSON file via `packages/db` (`.data/store.json`), written with
temp-file + `fsync` + `rename` and a sibling `store.json.bak` for crash recovery.
Production target: PostgreSQL + PostGIS (`packages/db/src/schema.sql.ts`).

## Entities

### Island

`id`, `slug`, `name`, `tagline`, `status` (`active` | `coming_soon`), optional `kind` (`province` | `region`), optional `region` (java / sumatra / …)

The Island row is the **province hub** (`aceh.nusa.business`, `jawa-timur.nusa.business`). Geographic island groups (`java.nusa.business`) are `kind: region` and list child provinces.

### Place

`id`, `islandId`, `slug`, `name`, `type` (`kabupaten` | `kota` | `tourist_area`), optional `parentPlaceId`, `summary`

### Business

Core listing. Key fields: `placeId`, `slug`, `name`, `status` (`draft` | `published` | `claimed`), `categories[]` (canonical taxonomy slugs from `@nusa/shared`), `facets?` (filter key → value slugs), profile/contact, `openingHours`, `gallery`, `bookingMode`, `ownerUserId`, `vendorId`, `registeredByAgentId`.

### User

`role`: `visitor` | `owner` | `vendor` | `field_agent` | `admin`  
Passwords in seed are **demo only**.

### Claim

Links `businessId` + `claimantUserId` + `status`.

### Review

Multi-criteria: `service`, `value`, `location`, `cleanliness` + comment.

### Booking

`mode`: `service` | `rental` | `event` with date/slot/tickets fields.

### VendorStore

multi-vendor shop linked to a business; `commissionPercent` default `0`; `products[]`. Future: `mercurVendorId`.

## Invariants

- `(islandId, place.slug)` unique  
- 38 provinces and 514 kabupaten/kota in seed + production bootstrap geography  
- `(placeId, business.slug)` unique  
- Approving a claim sets business `status=claimed` and `ownerUserId`  
