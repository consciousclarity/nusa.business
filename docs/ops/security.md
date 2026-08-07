# Security

## Current MVP caveats

- Demo users use plaintext passwords in the JSON store — **not production-safe**  
- Bearer tokens are predictable (`dev.{userId}`)  
- No rate limiting, CSRF strategy, or audit log yet  

## Hardening backlog

1. Better Auth (or Keycloak) with hashed passwords  
2. HTTP-only secure cookies on `.nusa.business`  
3. Role-based authorization middleware on every mutating route  
4. Image upload scanning + MinIO private buckets + signed URLs  
5. Rate limits on claim, login, field register  
6. Dependabot / `npm audit` in CI  
7. Secrets only via env / vault — never in seed for prod  

## Reporting

Prefer private disclosure to maintainers until a `SECURITY.md` process is published.
