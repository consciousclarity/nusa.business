# API endpoints

## Geography & discovery

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/islands` | All islands |
| GET | `/v1/islands/:island` | Island + places + businesses |
| GET | `/v1/islands/:island/places/:place` | Place hub payload |
| GET | `/v1/islands/:island/places/:place/businesses/:slug` | Public listing + scrubbed reviews + vendor (no bookings; drafts 404) |
| GET | `/v1/islands/:island/places/:place/businesses/:slug/discovery` | Same-address peers, similar ≤10 within `radiusKm` (default 2), nearby-by-category + map payload |
| GET | `/v1/places?island=` | Place list |
| GET | `/v1/search?q=&island=&place=&category=&{facet}=` | Flat search. Facet keys (cuisine, dietary, availability, …) are repeated query params; optional `lat`/`lng` for distance |
| GET | `/v1/meta/categories` | Flat `categories` labels, `taxonomy` tree, and `facets` catalog (`global`, `byGroup`, `indexable` paths) |
| GET | `/v1/host` | Debug: parsed `Host` header. **404 when `NODE_ENV=production`.** |

## Portal listings

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/portal/listings?ownerId=` | Inventory |
| POST | `/v1/portal/listings` | Create as draft or published; claimed requires claim approval |
| PATCH | `/v1/portal/listings/:id` | Update (allowlisted fields only; status is server-controlled) |

Listing writes return `409` if another listing occupies the same `(placeId, slug)`, including drafts. The JSON store enforces the check and save synchronously within the single API process.

## Auth

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/auth/login` | Rate-limited |
| POST | `/v1/auth/register` | Owner self-signup (`email`, `name`, `password`) or invite `token`. Clients cannot set `role`. |
| GET | `/v1/auth/invite/:token` | Preview a valid invite |
| POST | `/v1/auth/recovery/request` | Always 200; no email enumeration |
| POST | `/v1/auth/recovery/confirm` | Set a new password |
| GET | `/v1/me` | Authenticated profile |

See [auth.md](./auth.md).

## Claims & reviews

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/claims` | `{ businessId, claimantUserId, note? }` |
| GET | `/v1/claims` | List |
| POST | `/v1/claims/:id/decide` | `{ status: approved\|rejected }` |
| POST | `/v1/businesses/:id/reviews` | Multi-criteria review (runtime-validated) |
| GET | `/v1/reports?businessId=` | Admin inbox of correction/abuse reports |

## Bookings

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/businesses/:id/bookings` | Pending request only; `bookingMode != none`; optional `Idempotency-Key` |
| GET | `/v1/bookings?businessId=` | Inbox |

Booking body supports `startDate`, `endDate`, `timeSlot`, `guests`, `tickets` depending on mode.
Client `totalAmount` is ignored — not a priced inventory hold.
Dates must be actual calendar dates in `YYYY-MM-DD` format, **not in the past** (UTC).
Rentals require `endDate`; events require `tickets`. A second pending request with the same customer email and dates returns `409`.

An `Idempotency-Key` (up to 128 characters) can replay only the same normalized booking payload for the same business. Reusing it with a changed payload returns `409` without booking data. Unchanged retries return the original booking without creating another request; use a new key after editing the request. Replay records are in memory and reset on API restart.
Customer bookings are available through the authenticated owner/admin inbox, not public listing responses.

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
