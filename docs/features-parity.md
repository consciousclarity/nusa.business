# Capability map

Status key: **done** in this greenfield MVP · **partial** · **planned**

## Directory capabilities

| Capability | Status | Where |
|---|---|---|
| Listings + categories | done | Two-level Indonesia taxonomy in `@nusa/shared`; listings store slugs |
| Geo regions as first-class places | done | 38 provinces + 514 kabupaten/kota; Island row is the province hub ([ADR-007](architecture/adr/007-province-hosts.md)) |
| Nested hosts `place.island.nusa.business` | done | `@nusa/shared` `parseHost` + `/host/` dev routes; tourist areas nest as `/{area}/{slug}` under the kabupaten/kota host ([ADR-004](architecture/adr/004-admin-host-nested-path.md)) |
| Search / filters | partial | API `/v1/search` + public `/search?q=` + `/c/{category}` browse; allowlisted `/c/{category}/{facet}/{value}` index ([ADR-006](architecture/adr/006-indexable-facet-urls.md)) |
| Map search | partial | MapLibre + PostGIS still planned; Leaflet maps on nation, province, place, search, category browse, and listing location (lazy `/vendor/leaflet`) plus listing nearby-by-category |
| Opening hours / gallery / FAQ fields | partial | Hours seeded; gallery/FAQ schema present; lat/lng seeded for discovery; existing stores backfill missing pins on API boot (`2026-09-listing-coords`) |
| Claim listing | done | Portal `/claim` + API `/v1/claims` (owner self-register or invite, returnTo, pending until admin approve) |
| Multi-criteria reviews | done | service/value/location/cleanliness on listing + API |
| Owner dashboard | done | Portal listings CRUD |
| Booking: service / rental / event | partial | Request-only pending; server rejects past dates, missing rental/event fields, and duplicate pending rows; no priced inventory |
| WhatsApp / phone contact | done | Listing `wa.me` + `tel:` deep links (mobile-first) |
| Paid packages | planned | Model later; launch is free like bali.business |
| Private messages | planned | Phase 6 |
| Bookmarks | planned | Phase 6 |
| i18n en/id | partial | Public `/id` prefix + chrome copy including listing widgets, Indonesian category/facet labels, island names/taglines, JSON-LD, localized form errors, and HTML 404/500; listing body stays author language |
| Public SEO chrome | partial | Canonical + OG locale + JSON-LD + `/robots.txt` + `/sitemap.xml` (nested hosts + `/id`); privacy/terms/support |
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
Do not treat the local table in getting-started as production access.
