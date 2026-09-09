# Release decision (C14)

**Decision: HOLD — do not promote to the VPS yet.**

This page is the launch gate for nusa.business. Update the status table when
PRs merge and when an authorized operator completes live verification. Cursor
agents must not deploy without explicit human authorization.

## Gate status (repo)

| ID | Topic | Status | Notes |
|---|---|---|---|
| C01 | Public response privacy | merged / on `main` | |
| C02 | Production bootstrap safe | merged / on `main` | Confirm live store is not demo-seeded |
| C03 | SSR / browser API origins | merged / on `main` | Confirm `PUBLIC_BROWSER_API_URL` / `NUSA_SSR_API_URL` on VPS |
| C04 | Write validation / forms | merged / on `main` | |
| C05 | Owner onboarding / claims | merged + follow-ups | Invite returnTo `/invites` may still be an open PR |
| C06 | Authz / CORS / rate limits | open PR | Must land before public browser clients |
| C07 | JSON store durability | open PR | Required before trusting `.data` on disk |
| C08 | Mobile discovery / contact | open PR | |
| C09 | i18n en/id | open PR | |
| C10 | Public a11y | open PR | |
| C11 | Public SEO | open PR | |
| C12 | Public perf budget | open PR | |
| C13 | Ops runtime verification | open PR | PM2 vs Compose must be confirmed on box |
| C14 | Release decision | **HOLD** | [launch-readiness.md](./launch-readiness.md) — remaining operator/Hermes gates |

Exact PR numbers drift; use GitHub’s open PRs titled `C0x` / `C1x` against
`main`.

## Operator gates (live VPS)

Complete only with authorization. Record answers in the ops channel / ticket:

1. Running supervisor is **either** PM2 **or** Compose — not both ambiguous
   ([runtime-verification.md](./runtime-verification.md)).
2. `git rev-parse HEAD` under `/opt/nusa.business` matches an intended release
   SHA from `main`.
3. `.data/store.json` is backed up; demo seed users are absent or accepted.
4. Browser API is public HTTPS; SSR API is loopback/internal (C03).
5. Host Caddy + nested TLS ask path still healthy (`scripts/vps-status.sh`).
6. Rollback path written (previous SHA + store backup path).

## Flip to GO

Change the decision line at the top to **GO** only when:

- C06–C13 (and remaining C05 follow-ups) are merged or explicitly waived
- Operator gates 1–6 are checked
- A human names the release SHA and authorizes deploy

Until then: **HOLD**.
