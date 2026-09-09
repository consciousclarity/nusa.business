# Release decision (C14)

**Decision: GO — live SHA `e3cb8c53bef6a8061088e9c3cc56761aab0d77dd` (2026-09-09).**

Authorized deploy of [launch-readiness.md](./launch-readiness.md) follow-up
(PR #48) to the VPS. `bash scripts/live-public-check.sh` is **0 fails**.
Cursor agents must not deploy again without a new explicit authorization.

## Gate status (repo)

| ID | Topic | Status | Notes |
|---|---|---|---|
| C01 | Public response privacy | merged (#23) | |
| C02 | Production bootstrap safe | merged (#24) | Live store: 1 admin, **no** seed emails (`admin@nusa.business` / `agent@nusa.business` / `owner@example.com`) |
| C03 | SSR / browser API origins | merged (#25) | Live web: `PUBLIC_BROWSER_API_URL=https://api.nusa.business`, `NUSA_SSR_API_URL=http://api:8787` |
| C04 | Write validation / forms | merged (#26) | |
| C05 | Owner onboarding / claims | merged (#28, #30) + follow-up | Owner self-register or invite; claim stays pending until approve |
| C06 | Authz / CORS / rate limits | merged (#31) | |
| C07 | JSON store durability | merged (#32) | Store backed up; **isolated restore drill still operator** |
| C08 | Mobile discovery / contact | merged (#33) | Visitor chrome live |
| C09 | i18n en/id | merged (#34) | Listing body stays author language |
| C10 | Public a11y | merged (#35) | Chrome tests only; no screen-reader pass |
| C11 | Public SEO | merged (#36) | Nested-host sitemap live; **Search Console submit still operator** |
| C12 | Public perf budget | merged (#37) | Lab CI only; no RUM |
| C13 | Ops runtime verification | merged (#38) | **Compose** on loopback (`4101` / `4321` / `4103`); no PM2 |
| C14 | Release decision | **GO** | SHA below; live public check 0 fails |

C01–C14 code is on `main`. Launch-readiness follow-up is on the VPS at the
SHA below. Remaining operator work (isolated restore drill, Search Console)
does not block this GO. Cookie/CSRF, priced inventory, RUM, and `npm audit` CI
are still **not this launch**.

Read-only live HTML:

```bash
bash scripts/live-public-check.sh
```

## Live release record (2026-09-09)

| Item | Value |
|---|---|
| Release SHA | `e3cb8c53bef6a8061088e9c3cc56761aab0d77dd` (`Launch-readiness: booking rules, visitor search, ID chrome (#48)`) |
| Rollback SHA | `06bc62a996b9c9636747af7ca3b5d2eef707f149` (previous `main` on the box) |
| Supervisor | Docker Compose (`docker/compose.prod.yml`); containers `docker-api-1`, `docker-web-1`, `docker-portal-1` |
| Data | Volume `docker_api_data` → `/data` (not a host `/opt/nusa.business/.data`) |
| Store backup | `/var/backups/nusa/store.json.20260909T225942Z` (+ `.bak` sibling; earlier copies `20260909T225255Z` and `store.json.pre-demo-strip.20260909T225330Z`) |
| Demo seed | `NUSA_ALLOW_DEMO_SEED` unset; seed emails absent |
| `NUSA_AUTH_SECRET` | set (length ≥16; value not recorded here) |
| `scripts/vps-status.sh` | all checks passed (loopback, TLS ask, host Caddy, public hosts) |
| Live public check | 0 fails (homepage `/` and `/id` visitor chrome; listing `/id` Indonesian labels; sitemap nested hosts; robots `Disallow: /search`) |

Rollback: restore the backup file into volume `docker_api_data` as
`/data/store.json`, `git checkout` the rollback SHA under
`/opt/nusa.business`, then `bash scripts/deploy-vps.sh` (Compose — do not
start PM2).

## Operator gates (live VPS)

1. Running supervisor is **Compose** (confirmed 2026-09-09). Hermes 2026-09-07 PM2 notes are stale.
2. `git rev-parse HEAD` under `/opt/nusa.business` is `e3cb8c53bef6a8061088e9c3cc56761aab0d77dd`.
3. Store backed up; demo seed users absent.
4. Browser API is public HTTPS; SSR API is Compose DNS `http://api:8787`.
5. Host Caddy + nested TLS ask path healthy (`scripts/vps-status.sh`).
6. Rollback path written (rollback SHA + store backup paths above).

Still operator (not blocking GO): isolated restore drill in a non-production
directory; Search Console sitemap submit.

## Flip to GO

This page is **GO** because:

- Operator gates 1–6 are checked on the VPS
- Launch-readiness follow-up merged (#48) and deployed
- `bash scripts/live-public-check.sh` passes (no resolver jargon on `/` or `/id`; listing `/id` is Indonesian chrome; sitemap lists nested hosts, not `/host/bali`; robots Disallow `/search`)
- A human authorized deploy of SHA `e3cb8c53bef6a8061088e9c3cc56761aab0d77dd`
