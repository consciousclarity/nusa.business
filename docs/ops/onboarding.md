# Owner onboarding (invitation path)

Launch does **not** offer open self-signup. Admins issue invites; owners redeem
them; claims stay pending until an admin records a decision with optional reason.

## Flows

1. **Invite** — `POST /v1/invites` (admin) → deliver `registerPath` out-of-band
2. **Register** — `POST /v1/auth/register` with invite token + password (≥12)
3. **Claim** — `POST /v1/claims` with evidence note; duplicate pending → `409`
4. **Decide** — `POST /v1/claims/:id/decide` with `{ status, reason? }`; stores
   `decidedByUserId`, `decidedAt`, `decisionReason`; approving rejects other
   pending claims on the same listing
5. **Return URL** — unauthenticated `/claim?businessId=` redirects to
   `/login?returnTo=…` (validated by `safePortalReturnTo`)
6. **Recovery** — `POST /v1/auth/recovery/request` (+ admin
   `/v1/admin/recovery-tokens` when production hides tokens)

## Operator delivery

There is no SMTP in-repo yet. Treat invite/recovery tokens like passwords:
deliver via a trusted channel, never paste into public issues.

Dev/test may set `NUSA_EXPOSE_RECOVERY_TOKENS=1` (default outside production)
so recovery responses include the token for automated tests.
