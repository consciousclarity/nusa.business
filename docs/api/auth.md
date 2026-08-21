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

## Password storage

Passwords are hashed with **scrypt** (`packages/db/src/password.ts`) — memory-
hard, in Node's standard library, so no dependency and no native build step.

```
scrypt$<N>$<r>$<p>$<salt-base64>$<hash-base64>
```

Parameters are Node's defaults (N=16384, r=8, p=1, 64-byte key) with a random
16-byte salt per user, and verification uses `timingSafeEqual`. The cost
parameters are stored *in* the hash, so they can be raised later without
invalidating existing entries.

Two things keep an existing store from sitting at rest in plaintext:

- `hashStoredPasswords()` runs at API startup and after `npm run seed`, hashing
  anything still plaintext.
- `authenticate()` upgrades a legacy plaintext entry in place on the next
  successful login, as a backstop.

A login for an unknown email still performs one hash, so a missing account and
a wrong password take comparable time.

The demo credentials in `seed-data.ts` remain readable on purpose — they are
fixtures, and they are hashed as soon as they reach the store.

## Rate limiting

`apps/api/src/rate-limit.ts` — an in-memory sliding window, no dependency.

| Route | Limit | Keyed on |
|---|---|---|
| `POST /v1/auth/login` | 10 / 15 min | client address |
| `POST /v1/auth/login` | 5 / 15 min | normalised email |
| `POST /v1/businesses/:id/reviews` | 20 / hour | client address |
| `POST /v1/businesses/:id/bookings` | 20 / hour | client address |
| `POST /v1/claims` | 20 / hour | client address |

Exceeding a limit returns `429` with a `Retry-After` header in seconds. The two
login limits are deliberate: the per-address one stops a single attacker, and
the per-email one caps a *distributed* attack on one account — which matters
here because the demo passwords are published in this repo and
`admin@nusa.business` can approve claims.

### Identifying the caller

The API listens on loopback behind the host Caddy, so the socket peer is always
`127.0.0.1`. Caddy **appends** to `X-Forwarded-For`, and a client can send that
header itself — so the **leftmost entry is attacker-controlled and must never
be used as a key**. `resolveClientIp()` reads, in order:

1. `CF-Connecting-IP` — set for Cloudflare-proxied hosts (apex, `www`, island
   hubs). Nested place hosts are grey-clouded and have no such header.
2. The **rightmost** `X-Forwarded-For` entry — the one our own Caddy appended.
3. `"unknown"`.

### Never rate limited

- **`GET /v1/tls-check`** — Caddy's `on_demand_tls` ask endpoint. A 429 here
  stops certificate issuance, so nested hosts fail the TLS handshake. That is an
  outage, not a slow-down.
- **`GET /health`** — the `deploy-vps.sh` gate polls it up to 30 times in 60
  seconds.

Limits are applied per route, never globally, so nothing else is caught by
accident.

### Tuning and limitations

Override via `.env`: `NUSA_RATELIMIT_LOGIN_MAX`, `NUSA_RATELIMIT_LOGIN_WINDOW_MS`,
`NUSA_RATELIMIT_LOGIN_EMAIL_MAX`, `NUSA_RATELIMIT_WRITE_MAX`,
`NUSA_RATELIMIT_WRITE_WINDOW_MS`. `NUSA_RATELIMIT_DISABLED=1` turns it off for
local development.

**State is per-process and resets on restart.** That is correct for the single
`api` service in `docker/compose.prod.yml`, and wrong the moment there is a
second replica — two containers would each allow the full quota. The successors,
in order of effort: a Cloudflare rate-limiting rule at the edge (the free tier
covers one login rule, and it also protects against traffic that never reaches
the origin), or a shared Redis counter.

## Still to do before public launch

- Consider HTTP-only cookies scoped to `.nusa.business` for SSO across
  subdomains, instead of `localStorage`.
