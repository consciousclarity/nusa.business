# Security

## Current posture (MVP → launch hardening)

- Passwords: scrypt hashes in the JSON store (`packages/db`); plaintext only as a
  one-time upgrade path for legacy rows.
- Bearer tokens: HMAC-signed, expiring (`apps/api/src/auth.ts`). Production
  requires `NUSA_AUTH_SECRET` (≥16 chars).
- Rate limits: login + public review/booking writes (`apps/api/src/rate-limit.ts`).
- JSON store: atomic replace (temp + `fsync` + `rename`) with `store.json.bak`
  last-known-good; corrupt primary/backup refuse silent re-seed.
- CORS: browser origins must match `https://*.nusa.business` (or loopback in
  non-production), plus optional `NUSA_CORS_ORIGINS` — no reflect-any-origin.
- Public HTML sends `Content-Security-Policy-Report-Only` (inline scripts still
  required for listing widgets). There is no report collector yet.
- Demo catalog: **not** auto-created when `NODE_ENV=production`. See
  [demo-bootstrap.md](./demo-bootstrap.md).

## Hardening backlog

1. Better Auth (or similar) with HTTP-only secure cookies on `.nusa.business`
2. CSRF strategy if cookie sessions are introduced
3. Image upload scanning + MinIO private buckets + signed URLs
4. Dependabot / `npm audit` in CI
5. Shared rate-limit store before multiple API replicas
6. Secrets only via env / vault — never demo passwords in production
7. Postgres cutover when a single JSON file is no longer enough
8. CSP report collector + tighten `script-src` once listing widgets are hashed

## Reporting

Prefer private disclosure to maintainers until a `SECURITY.md` process is published.