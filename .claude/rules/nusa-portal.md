---
paths:
  - "apps/portal/**"
---

# apps/portal

- Authenticated directory dashboards: listings, claim, field ops, bookings, vendor.
- Session token is stored in `localStorage` under `nusa.session`. The token is
  **HMAC-SHA256 signed and verified server-side** (`apps/api/src/auth.ts`) — it
  is not a forgeable dev string. Cookie-based SSO is still planned.
- Call the API through `src/api.ts`; do not duplicate business rules in the UI.
- Role gates: owner / vendor / field_agent / admin — match the API checks.
  Identity always comes from the verified token, never from a request body.
