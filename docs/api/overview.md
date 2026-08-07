# API overview

Base URL (local): `http://localhost:8787`

All product routes are under `/v1`. Health: `GET /health`.

## Conventions

- JSON request/response  
- Errors: `{ "error": "message" }` with 4xx/5xx  
- CORS enabled for local web/portal origins  

## Resource groups

| Group | Prefix |
|---|---|
| Meta / host | `/v1/meta`, `/v1/host` |
| Geography | `/v1/islands`, `/v1/places` |
| Search | `/v1/search` |
| Auth | `/v1/auth`, `/v1/me` |
| Portal listings | `/v1/portal/listings` |
| Claims | `/v1/claims` |
| Reviews / bookings | `/v1/businesses/:id/…` |
| Field ops | `/v1/field/…` |
| Marketplace | `/v1/marketplace/vendors` |

Details: [endpoints.md](./endpoints.md) · [auth.md](./auth.md)
