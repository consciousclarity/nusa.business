# Release decision (C14)

**Decision: HOLD — do not promote to the VPS yet.**

This page is the launch gate for nusa.business. Update the status table when
PRs merge and when an authorized operator completes live verification. Cursor
agents must not deploy without explicit human authorization.

## Gate status (repo)

| ID | Topic | Status | Notes |
|---|---|---|---|
| C01 | Public response privacy | merged (#23) | |
| C02 | Production bootstrap safe | merged (#24) | Confirm live store is not demo-seeded |
| C03 | SSR / browser API origins | merged (#25) | Confirm `PUBLIC_BROWSER_API_URL` / `NUSA_SSR_API_URL` on VPS |
| C04 | Write validation / forms | merged (#26) | |
| C05 | Owner onboarding / claims | merged (#28, #30) + follow-up | Owner self-register or invite; claim stays pending until approve |
| C06 | Authz / CORS / rate limits | merged (#31) | |
| C07 | JSON store durability | merged (#32) | Isolated restore drill still unverified |
| C08 | Mobile discovery / contact | merged (#33) | Follow-up visitor chrome in launch-readiness PR |
| C09 | i18n en/id | merged (#34) | Listing body stays author language |
| C10 | Public a11y | merged (#35) | Chrome tests only; no screen-reader pass |
| C11 | Public SEO | merged (#36) | Search Console submission is operator |
| C12 | Public perf budget | merged (#37) | Lab CI only; no RUM |
| C13 | Ops runtime verification | merged (#38) | PM2 vs Compose must still be confirmed on box |
| C14 | Release decision | **HOLD** | [launch-readiness.md](./launch-readiness.md) — remaining operator/Hermes gates |

C01–C14 code is on `main`. Remaining launch work is operator verification plus
the follow-up in [launch-readiness.md](./launch-readiness.md) (booking
date/duplicate rules, visitor search, Indonesian category/facet labels, JSON-LD
locale, `/id` sitemap locs, sample stamps). Do not treat merged code as a live
GO. Read-only live HTML:

```bash
bash scripts/live-public-check.sh
```

That script currently **fails** homepage visitor chrome (`class="resolver"`,
`kind=nation`) until the follow-up is deployed. Listing API origin may already
pass. Cursor agents must not deploy.

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

- Operator gates 1–6 are checked on the VPS
- Launch-readiness follow-up (booking rules, visitor chrome, sample labels) is merged or waived
- `bash scripts/live-public-check.sh` passes (homepage has no resolver jargon)
- A human names the release SHA and authorizes deploy

Until then: **HOLD**.
