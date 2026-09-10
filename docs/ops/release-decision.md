# Release decision (C14)

**Decision: GO — live SHA `eaf4bc219d614033127d9b6af00c7dade1caab86` (2026-09-10).**

Authorized by the repository owner (“i authorize the new main SHA”). Cursor
deployed `main` at `eaf4bc2` — directory maps (#56) plus #51–#55 already on
`main` — to the VPS with Compose (`scripts/deploy-vps.sh`). Previous live SHA
`e3cb8c53` is the rollback. `bash scripts/vps-status.sh` passed. After fixing
a SIGPIPE false-fail in `scripts/live-public-check.sh` (grep -q on the
~117KiB sitemap), `bash scripts/live-public-check.sh` is **0 fails**. Cursor
agents must not deploy again without a new explicit authorization. GitHub
Actions must not either: `.github/workflows/ci.yml` is build + test + seed
only (see [vps-deploy.md](./vps-deploy.md)). A push to `main` is not a deploy.

## Release record

| Field | Value |
|---|---|
| Decision | **GO** |
| Authorized by | repository owner (chat authorization 2026-09-10: “i authorize the new main SHA”) |
| Release SHA | `eaf4bc219d614033127d9b6af00c7dade1caab86` (`main`, `feat: add maps on directory pages (#56)`) |
| Rollback SHA | `e3cb8c53bef6a8061088e9c3cc56761aab0d77dd` (previous live; Launch-readiness #48) |
| Supervisor | **Docker Compose only** (`docker/compose.prod.yml`); containers `docker-api-1`, `docker-web-1`, `docker-portal-1`; no PM2 |
| App path | `/opt/nusa.business` |
| Data | Volume `docker_api_data` → container `/data` (not a host `/opt/nusa.business/.data`) |
| Store backup | `/var/backups/nusa/store.json.20260910T090039Z` (+ `.bak` sibling; prior GO copy `20260909T225942Z`) |
| Demo seed | `NUSA_ALLOW_DEMO_SEED` unset; seed emails absent; live store 1 user / 39 businesses |
| `NUSA_AUTH_SECRET` | set (length ≥16; not rotated this promote; value not recorded here) |
| `scripts/vps-status.sh` | all checks passed (loopback, TLS ask, host Caddy, public hosts including `jakarta.java`) |
| Live public check | 0 fails after SIGPIPE-safe substring checks (homepage `/` and `/id` visitor chrome; listing `/id` Indonesian labels; sitemap nested hosts; robots `Disallow: /search`; directory maps present on `/` and listing) |
| Rollback | restore the store backup into Compose volume `docker_api_data` as `/data/store.json`, `git checkout` the rollback SHA under `/opt/nusa.business`, then `bash scripts/deploy-vps.sh` (Compose — do not start PM2) |

## Gate status (repo)

| ID | Topic | Status | Notes |
|---|---|---|---|
| C01 | Public response privacy | merged (#23) | |
| C02 | Production bootstrap safe | merged (#24) | Live store: 1 admin, **no** seed emails (`admin@nusa.business` / `agent@nusa.business` / `owner@example.com`) |
| C03 | SSR / browser API origins | merged (#25) | Live web: `PUBLIC_BROWSER_API_URL=https://api.nusa.business`, `NUSA_SSR_API_URL=http://api:8787` |
| C04 | Write validation / forms | merged (#26) | |
| C05 | Owner onboarding / claims | merged (#28, #30) | `/invites` returnTo follow-up is on `main` |
| C06 | Authz / CORS / rate limits | merged (#31) | |
| C07 | JSON store durability | merged (#32) | Pre-deploy backup taken; **isolated restore drill still operator** |
| C08 | Mobile discovery / contact | merged (#33) | Visitor chrome live; launch-readiness follow-up deployed |
| C09 | i18n en/id | merged (#34) | Listing body stays author language |
| C10 | Public a11y | merged (#35) | Chrome tests only; no screen-reader pass |
| C11 | Public SEO | merged (#36) | Nested-host sitemap live; **Search Console submit still operator** |
| C12 | Public perf budget | merged (#37) | Lab CI only; no RUM |
| C13 | Ops runtime verification | merged (#38) | **Compose** on loopback (`4101` / `4321` / `4103`); no PM2 |
| C14 | Release decision | **GO** | This document; live public check 0 fails |

C01–C14 code is on `main`. Live VPS is `eaf4bc2` (#56 maps, plus #51 coords,
#53 provinces/kabupaten, #54 Bali CTA removal, #55 CI auto-deploy removal).
Remaining operator work (isolated restore drill, Search Console) does not
block this GO. Cookie/CSRF, priced inventory, RUM, and `npm audit` CI are
still **not this launch**.

## Operator gates (verified live)

1. **Supervisor:** Compose (`docker/compose.prod.yml`) — PM2 absent. See
   [runtime-verification.md](./runtime-verification.md). Hermes 2026-09-07 PM2
   notes are stale.
2. **SHA:** `/opt/nusa.business` at `eaf4bc219d614033127d9b6af00c7dade1caab86`.
3. **Store backup + demo accounts:** volume `docker_api_data` (`NUSA_DATA_DIR=/data`)
   backed up under `/var/backups/nusa/`; published demo emails
   (`admin@nusa.business`, `agent@nusa.business`, `owner@example.com`) **removed**
   (not accepted). Ops admin `ops@nusa.business` created with a one-time password
   delivered out of band to the authorizing operator.
4. **API origins:** `PUBLIC_BROWSER_API_URL=https://api.nusa.business`;
   container `NUSA_SSR_API_URL=http://api:8787`.
5. **Caddy / TLS / public:** `bash scripts/vps-status.sh` passed (loopback,
   tls-check, host Caddy, public hosts).
6. **Rollback path:** previous live SHA `e3cb8c53` + `/var/backups/nusa/store.json.20260910T090039Z`
   recorded above. `NUSA_AUTH_SECRET` was **not** rotated this promote.

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
Indonesian labels, nested sitemap locs, robots search Disallow, directory
maps on `/` and listing). `scripts/live-public-check.sh` uses `has()` so the
117KiB sitemap does not SIGPIPE `grep -q`.

## Post-GO operator follow-ups

- Change the one-time `ops@nusa.business` password after first login.
- Search Console / property verification (C11).
- Isolated C07 restore drill into a scratch volume (non-production directory).
- Screen-reader pass (C10) and RUM (C12) remain non-blocking.

None of these block this GO.

## Flip to GO

This page is **GO** because:

- Operator gates 1–6 are checked on the VPS
- `main` at `eaf4bc2` authorized and deployed (Compose `scripts/deploy-vps.sh`)
- `bash scripts/live-public-check.sh` passes (no resolver jargon on `/` or `/id`; listing `/id` is Indonesian chrome; sitemap lists nested hosts, not `/host/bali`; robots Disallow `/search`; directory maps on public geo pages)
- A human authorized deploy of SHA `eaf4bc219d614033127d9b6af00c7dade1caab86`
