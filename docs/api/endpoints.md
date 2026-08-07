# API endpoints

## Geography & discovery

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/islands` | All islands |
| GET | `/v1/islands/:island` | Island + places + businesses |
| GET | `/v1/islands/:island/places/:place` | Place hub payload |
| GET | `/v1/islands/:island/places/:place/businesses/:slug` | Listing + reviews + vendor + bookings |
| GET | `/v1/places?island=` | Place list |
| GET | `/v1/search?q=&island=&place=&category=` | Flat search |
| GET | `/v1/meta/categories` | Category catalog |
| GET | `/v1/host` | Debug: parsed `Host` header |

## Portal listings

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/portal/listings?ownerId=` | Inventory |
| POST | `/v1/portal/listings` | Create |
| PATCH | `/v1/portal/listings/:id` | Update |

## Claims & reviews

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/claims` | `{ businessId, claimantUserId, note? }` |
| GET | `/v1/claims` | List |
| POST | `/v1/claims/:id/decide` | `{ status: approved\|rejected }` |
| POST | `/v1/businesses/:id/reviews` | Multi-criteria review |

## Bookings

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/businesses/:id/bookings` | Requires `bookingMode != none` |
| GET | `/v1/bookings?businessId=` | Inbox |

Booking body supports `startDate`, `endDate`, `timeSlot`, `guests`, `tickets` depending on mode.

## Field ops

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/field/register` | Agent/admin only |
| GET | `/v1/field/recent?island=&place=` | Recent agent listings |

## Marketplace

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/marketplace/vendors/:id` | Store + Mercur stub metadata |
| POST | `/v1/marketplace/vendors` | Link shop to business (0% commission) |
