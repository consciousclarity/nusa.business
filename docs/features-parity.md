# Capability map

Status key: **done** in this greenfield MVP · **partial** · **planned**

## Directory capabilities

| Capability | Status | Where |
|---|---|---|
| Listings + categories | done | Two-level Indonesia taxonomy in `@nusa/shared`; listings store slugs |
| Geo regions as first-class places | done | Island / Place model + host parser |
| Nested hosts `place.island.nusa.business` | done | `@nusa/shared` `parseHost` + `/host/` dev routes; tourist areas nest as `/{area}/{slug}` under the kabupaten/kota host ([ADR-004](architecture/adr/004-admin-host-nested-path.md)) |
| Search / filters | partial | API `/v1/search`; place-hub category filter (`?category=`) |
| Map search | planned | MapLibre + PostGIS (schema outlined); listing nearby uses Leaflet + haversine MVP |
| Opening hours / gallery / FAQ fields | partial | Hours seeded; gallery/FAQ schema present; lat/lng seeded for discovery |
| Claim listing | done | Portal `/claim` + API `/v1/claims` (invite onboarding, returnTo, decision audit) |
| Multi-criteria reviews | done | service/value/location/cleanliness on listing + API |
| Owner dashboard | done | Portal listings CRUD |
| Booking: service / rental / event | done | Listing `bookingMode` + public form + `/v1/.../bookings` (request-only / pending; not verified inventory or price) |
| WhatsApp / phone contact | done | Listing `wa.me` + `tel:` deep links (mobile-first) |
| Paid packages | planned | Model later; launch is free like bali.business |
| Private messages | planned | Phase 6 |
| Bookmarks | planned | Phase 6 |
| i18n en/id | partial | Public `/id` prefix + chrome copy; listing body stays author language |
| Public SEO chrome | partial | Canonical + OG + JSON-LD + `/robots.txt` + `/sitemap.xml` |
| AI local guide | planned | Optional |

## Marketplace capabilities

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

Local/dev only — see [ops/demo-bootstrap.md](./ops/demo-bootstrap.md). Production
builds do not embed these, and production storage does not auto-create them.

| Email | Password | Role |
|---|---|---|
| admin@nusa.business | admin123 | admin |
| agent@nusa.business | agent123 | field_agent |
| owner@example.com | owner123 | owner |
