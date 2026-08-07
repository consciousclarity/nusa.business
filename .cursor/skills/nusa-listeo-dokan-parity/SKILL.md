---
name: nusa-listeo-dokan-parity
description: >-
  Map Listeo directory/booking and Dokan marketplace features onto Nusa modules.
  Use when implementing claims, reviews, bookings, packages, vendor shops, or
  Mercur integration; keep docs/features-parity.md accurate.
---

# Listeo + Dokan parity skill

## Principle

Reimplement **capabilities**, not PHP. Track status in `docs/features-parity.md`.

## Listeo → Nusa

| Listeo | Nusa |
|---|---|
| Listings / categories / regions | Island / Place / Business |
| Claim | `/v1/claims` + portal `/claim` |
| Reviews (multi-criteria) | service, value, location, cleanliness |
| Owner dashboard | `apps/portal` listings |
| Booking rental/service/event | `bookingMode` + `/v1/.../bookings` |
| Packages | planned — free tier default |
| Messages / bookmarks | planned |

## Dokan → Nusa

| Dokan | Nusa |
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
