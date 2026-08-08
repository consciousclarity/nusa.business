# Auth

## Login

`POST /v1/auth/login`

```json
{ "email": "owner@example.com", "password": "owner123" }
```

Response:

```json
{
  "user": { "id": "usr-owner", "email": "…", "name": "…", "role": "owner" },
  "token": "eyJzdWIiOiJ1c3Itb3duZXIi….<signature>"
}
```

## Tokens

Bearer tokens are **HMAC-SHA256 signed** and stateless:

```
base64url({ sub, role, iat, exp }) . base64url(HMAC-SHA256(body, NUSA_AUTH_SECRET))
```

- Signed with `NUSA_AUTH_SECRET` (≥16 chars). The API refuses to start without
  it when `NODE_ENV=production`; in development it falls back to a fixed dev
  secret and logs a warning.
- Expire after `NUSA_TOKEN_TTL` seconds (default 7 days).
- The `sub` is only a *claim*. Every request re-reads the user from the store,
  so deleting a user or changing their role takes effect immediately rather
  than at token expiry.
- Signature comparison uses `timingSafeEqual`.

Rotating the secret invalidates all outstanding tokens.

## Authenticated calls

Header: `Authorization: Bearer <token>`

`GET /v1/me` returns the caller without their password.

The portal attaches the stored token automatically — `api()` in
`apps/portal/src/api.ts` reads `nusa.session` from `localStorage` unless a
token is passed explicitly.

## Route matrix

| Route | Access |
|---|---|
| `GET /health`, `/v1/meta/*`, `/v1/host`, `/v1/tls-check` | public |
| `GET /v1/islands*`, `/v1/places`, `/v1/search`, `/v1/field/recent` | public |
| `POST /v1/businesses/:id/reviews` | public — visitors review without an account |
| `POST /v1/businesses/:id/bookings` | public — customers book without an account |
| `GET /v1/me` | any authenticated user |
| `GET /v1/portal/listings` | own listings; admin sees all |
| `POST /v1/portal/listings` | `owner`, `vendor`, `field_agent`, `admin` |
| `PATCH /v1/portal/listings/:id` | listing owner, or admin |
| `POST /v1/claims` | any authenticated user (claimant = caller) |
| `GET /v1/claims` | own claims; admin sees all |
| `POST /v1/claims/:id/decide` | **admin only** |
| `GET /v1/bookings` | bookings for own businesses; admin sees all |
| `POST /v1/field/register` | `field_agent`, `admin` |
| `POST /v1/marketplace/vendors` | business owner, or admin |

### Identity is never taken from the request body

`ownerUserId`, `claimantUserId` and `agentId` come from the verified token, not
from client input. A non-admin sending `ownerUserId` for someone else has it
silently replaced with their own id; only an admin may act on another user's
behalf.

## Still to do before public launch

- **Password hashing** — seeds store plaintext. Move to Argon2/bcrypt.
- **Rate limiting** on `/v1/auth/login` and the public review/booking routes.
- Consider HTTP-only cookies scoped to `.nusa.business` for SSO across
  subdomains, instead of `localStorage`.
