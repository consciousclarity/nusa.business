# Release decision (C14)

**Decision: GO — promoted to the VPS on 2026-09-09.**

Authorized by the repository owner (“i authorize”). Cursor deployed
`main` after operator gates below were verified live.

## Release record

| Field | Value |
|---|---|
| Decision | **GO** |
| Authorized by | repository owner (chat authorization 2026-09-09) |
| Release SHA | `e3cb8c53bef6a8061088e9c3cc56761aab0d77dd` (`main`) |
| Previous SHA | `06bc62a996b9c9636747af7ca3b5d2eef707f149` |
| Supervisor | **Docker Compose only** (no PM2) |
| App path | `/opt/nusa.business` |
| Store backup | `/var/backups/nusa/store.json.20260909T225255Z` (+ `.bak`) |
| Rollback | restore that backup into Compose volume `docker_api_data` → `/data/store.json`, `git checkout` previous SHA, `bash scripts/deploy-vps.sh` |

## Gate status (repo)

| ID | Topic | Status | Notes |
|---|---|---|---|
| C01 | Public response privacy | merged (#23) | |
| C02 | Production bootstrap safe | merged (#24) | Live store is not demo-seeded; published demo accounts removed |
| C03 | SSR / browser API origins | merged (#25) | Browser `https://api.nusa.business`; SSR `http://api:8787` |
| C04 | Write validation / forms | merged (#26) | |
| C05 | Owner onboarding / claims | merged (#28, #30) | `/invites` returnTo follow-up is on `main` |
| C06 | Authz / CORS / rate limits | merged (#31) | |
| C07 | JSON store durability | merged (#32) | Pre-deploy backup taken; isolated restore drill still optional |
| C08 | Mobile discovery / contact | merged (#33) | Launch-readiness follow-up deployed |
| C09 | i18n en/id | merged (#34) | Listing body stays author language |
| C10 | Public a11y | merged (#35) | Chrome tests only; no screen-reader pass |
| C11 | Public SEO | merged (#36) | Search Console submission remains operator |
| C12 | Public perf budget | merged (#37) | Lab CI only; no RUM |
| C13 | Ops runtime verification | merged (#38) | Compose confirmed on box |
| C14 | Release decision | **GO** | This document |

## Operator gates (verified live)

1. **Supervisor:** Compose (`docker/compose.prod.yml`) — PM2 absent. See
   [runtime-verification.md](./runtime-verification.md).
2. **SHA:** `/opt/nusa.business` at `e3cb8c53bef6a8061088e9c3cc56761aab0d77dd`.
3. **Store backup + demo accounts:** volume `docker_api_data` (`NUSA_DATA_DIR=/data`)
   backed up under `/var/backups/nusa/`; published demo emails
   (`admin@nusa.business`, `agent@nusa.business`, `owner@example.com`) **removed**
   (not accepted). Ops admin `ops@nusa.business` created with a one-time password
   delivered out of band to the authorizing operator.
4. **API origins:** `PUBLIC_BROWSER_API_URL=https://api.nusa.business`;
   container `NUSA_SSR_API_URL=http://api:8787`.
5. **Caddy / TLS / public:** `bash scripts/vps-status.sh` passed (loopback,
   tls-check, host Caddy, public hosts).
6. **Rollback path:** previous SHA + `/var/backups/nusa/store.json.20260909T225255Z`
   recorded above. `NUSA_AUTH_SECRET` was rotated at promote time (sessions reset).

### Compose vs PM2 store paths

| Runtime | Persistent store | Backup approach |
|---|---|---|
| **Compose (live)** | Named volume `docker_api_data` → container `/data/store.json` | `docker run --rm -v docker_api_data:/data:ro -v /var/backups/nusa:/backup alpine cp /data/store.json /backup/…` |
| PM2 (not in use) | Host tree under `/opt/nusa.business/.data/store.json` | `cp -a .data/store.json /var/backups/nusa/…` |

Do **not** treat a host `.data/store.json` copy as sufficient while Compose is
the supervisor — that path is not the live volume.

## Live HTML gate

```bash
bash scripts/live-public-check.sh
```

Passed after this promote (homepage `/` + `/id` visitor chrome, listing `/id`
Indonesian labels, nested sitemap locs, robots search Disallow).

## Post-GO operator follow-ups

- Change the one-time `ops@nusa.business` password after first login.
- Search Console / property verification (C11).
- Optional isolated C07 restore drill into a scratch volume.
- Screen-reader pass (C10) and RUM (C12) remain non-blocking.
