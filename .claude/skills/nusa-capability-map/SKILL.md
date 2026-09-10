---
name: nusa-capability-map
description: >-
  Map directory, booking and multi-vendor marketplace capabilities onto Nusa modules.
  Use when implementing claims, reviews, bookings, packages, vendor shops, or
  Mercur integration; keep docs/features-parity.md accurate.
---

# Capability map skill

## Principle

Reimplement **capabilities**, not PHP. Track status in `docs/features-parity.md`.

## Directory capabilities

| Capability | Nusa |
|---|---|
| Listings / categories / regions | Island / Place / Business |
| Claim | `/v1/claims` + portal `/claim` |
| Reviews (multi-criteria) | service, value, location, cleanliness |
| Owner dashboard | `apps/portal` listings |
| Booking rental/service/event | `bookingMode` + `/v1/.../bookings` |
| Packages | planned — free tier default |
| Messages / bookmarks | planned |

## Marketplace capabilities

| Capability | Nusa |
|---|---|
| Vendor store | `/v1/marketplace/vendors` (+ listing Shop tab) |
| Products | `VendorStore.products` |
| Commission | `commissionPercent` default **0** |
| Full cart/checkout/payouts | Mercur/Medusa — see `docs/mercur-integration.md` |

## Implementation order (preferred)

1. Directory + claim + reviews  
2. Field ops registration  
3. Booking modes  
4. Vendor link + Mercur  
5. Packages / messaging  

## Done means

- API + UI path exists  
- Seed or demo covers happy path  
- Parity doc row updated (`done` / `partial` / `planned`)
