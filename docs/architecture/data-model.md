# Data model

MVP persistence: JSON file via `packages/db` (`.data/store.json`). Production target: PostgreSQL + PostGIS (`packages/db/src/schema.sql.ts`).

## Entities

### Island

`id`, `slug`, `name`, `tagline`, `status` (`active` | `coming_soon`)

### Place

`id`, `islandId`, `slug`, `name`, `type` (`kabupaten` | `kota` | `tourist_area`), optional `parentPlaceId`, `summary`

### Business

Core listing. Key fields: `placeId`, `slug`, `name`, `status` (`draft` | `published` | `claimed`), `categories[]`, profile/contact, `openingHours`, `gallery`, `bookingMode`, `ownerUserId`, `vendorId`, `registeredByAgentId`.

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

Dokan-parity shop linked to a business; `commissionPercent` default `0`; `products[]`. Future: `mercurVendorId`.

## Invariants

- `(islandId, place.slug)` unique  
- `(placeId, business.slug)` unique  
- Approving a claim sets business `status=claimed` and `ownerUserId`  
