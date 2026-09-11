# Release decision (C14)

**Decision: GO — live SHA `a2c93bc67b2f426645f1f295e59d9f61bebd9f6e` (2026-09-11).**

Authorized by the repository owner (chat: "please deploy main", after an
explicit "no more pr" signal that the dependency-PR cleanup was done). An
operator deployed `main` at `a2c93bc` to the VPS with Compose
(`scripts/deploy-vps.sh`). Previous live SHA `eaf4bc2` is the rollback.
`bash scripts/vps-status.sh` passed. `bash scripts/live-public-check.sh` is
37/38 — the one failure is a stale check-script assertion, not a live
content gap (see "Known live-check gap" below). Cursor agents must not
deploy again without a new explicit authorization. GitHub Actions must not
either: `.github/workflows/ci.yml` is build + test + seed only (see
[vps-deploy.md](./vps-deploy.md)). A push to `main` is not a deploy.

**A first attempt at this promote, targeting `8491232`, failed to build**
(the portal Docker image hit `TS2688: Cannot find type definition file for
'node'` — a gap in #89's TypeScript 7 fix that only showed up under the
Dockerfiles' scoped `npm install`, not a full monorepo install). Compose
kept the previous (`eaf4bc2`) containers running throughout — no downtime,
no rollback needed. Fixed in #90 (`packages/shared` now declares
`@types/node` explicitly); this record is for the successful re-attempt.

## Release record

| Field | Value |
|---|---|
| Decision | **GO** |
| Authorized by | repository owner (chat authorization 2026-09-11: "please deploy main") |
| Release SHA | `a2c93bc67b2f426645f1f295e59d9f61bebd9f6e` (`main`, `fix(shared): declare @types/node explicitly, don't rely on vite's peer dep (#90)`) |
| Failed attempt | `8491232e8ef3850989fdbd1bebd70b2c879e9fcc` — portal image build failure, never went live; see above |
| Rollback SHA | `eaf4bc219d614033127d9b6af00c7dade1caab86` (previous live; directory maps #56) |
| Supervisor | **Docker Compose only** (`docker/compose.prod.yml`); containers `docker-api-1`, `docker-web-1`, `docker-portal-1`; no PM2 |
| App path | `/opt/nusa.business` |
| Data | Volume `docker_api_data` → container `/data` (not a host `/opt/nusa.business/.data`) |
| Store backup | Taken before this promote via the documented Compose-volume `docker run ... cp /data/store.json /backup/store.json.<UTC timestamp>` command; exact filename not captured in the session transcript — check `/var/backups/nusa/` for the newest entry before relying on it for rollback |
| Demo seed | Not re-verified this promote (no seed/store-shape change since the last GO) |
| `NUSA_AUTH_SECRET` | not rotated this promote |
| `scripts/vps-status.sh` | all checks passed (containers, git HEAD, loopback upstreams, TLS ask endpoint, host Caddy, public endpoints, capacity) |
| Live public check | 37/38 passed. One `FAIL`: "listing /id missing Indonesian review chrome Nilai ulasan" — `scripts/live-public-check.sh` greps for the literal phrase `"Nilai ulasan"`, but the actual (equally complete) Indonesian copy splits it into `reviews: "Ulasan"` (section heading) + `reviewScoresLegend: "Nilai (1–5)"` (score legend) in `apps/web/src/i18n/ui.ts`. This is a stale assertion in the check script, not missing localization — confirmed identical on the prior failed-build attempt too, i.e. present before this promote. Worth fixing the script's assertion, not blocking. |
| Rollback | restore the newest pre-promote store backup into Compose volume `docker_api_data` as `/data/store.json`, `git checkout eaf4bc219d614033127d9b6af00c7dade1caab86` under `/opt/nusa.business`, then `bash scripts/deploy-vps.sh` (Compose — do not start PM2) |

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
| C14 | Release decision | **GO** | This document; live public check 37/38 (1 stale-assertion, not a content gap) |

C01–C14 code is on `main`. Live VPS is `a2c93bc` — everything merged between
`eaf4bc2` and `a2c93bc`, including a full visual redesign (#60, #61), the
listing-page simplification (#63), the wide-directory responsive relayout
(#64), the astro 5→7 major bump (#72), the Dependabot governance overhaul
(#70, #73–#90), and ~13 dependency updates (Node 22→26 base images,
react-router 8, vite 8, typescript 7, `@hono/node-server` 2, etc.), all
individually build/test-verified before merge. Remaining operator work
(isolated restore drill, Search Console, the stale live-check assertion)
does not block this GO. Cookie/CSRF, priced inventory, RUM, and `npm audit`
CI are still **not this launch**.

## Operator gates (verified live)

1. **Supervisor:** Compose (`docker/compose.prod.yml`) — PM2 absent. See
   [runtime-verification.md](./runtime-verification.md). Hermes 2026-09-07 PM2
   notes are stale.
2. **SHA:** `/opt/nusa.business` at `a2c93bc67b2f426645f1f295e59d9f61bebd9f6e`.
3. **Store backup:** volume `docker_api_data` (`NUSA_DATA_DIR=/data`) backed
   up under `/var/backups/nusa/` before this promote (see Release record —
   confirm the newest file there before relying on it). Demo-account state
   not re-verified this promote (no seed/store-shape change since the last
   GO's removal of the published demo emails).
4. **API origins:** unchanged from the last verified GO
   (`PUBLIC_BROWSER_API_URL=https://api.nusa.business`; container
   `NUSA_SSR_API_URL=http://api:8787`) — not independently re-checked this
   promote.
5. **Caddy / TLS / public:** `bash scripts/vps-status.sh` passed (containers,
   git HEAD, loopback, tls-check, host Caddy, public hosts, capacity).
6. **Rollback path:** previous live SHA `eaf4bc2` + the newest pre-promote
   store backup under `/var/backups/nusa/`. `NUSA_AUTH_SECRET` was **not**
   rotated this promote.

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

37/38 after this promote (homepage `/` + `/id` visitor chrome, listing `/id`
Indonesian labels, nested sitemap locs, robots search Disallow). The one
`FAIL` is the stale `"Nilai ulasan"` assertion described above.
`scripts/live-public-check.sh` uses `has()` so the 117KiB sitemap does not
SIGPIPE `grep -q`.

## Known live-check gap (non-blocking)

`scripts/live-public-check.sh` asserts the listing `/id` page contains the
literal phrase `"Nilai ulasan"`. The actual Indonesian copy in
`apps/web/src/i18n/ui.ts` splits this across two separate, both-Indonesian
strings instead: `reviews: "Ulasan"` (section heading) and
`reviewScoresLegend: "Nilai (1–5)"` (score legend) — there is no English
leakage, just different wording than the check expects. Fix the script's
assertion to match actual copy (or vice versa, if `"Nilai ulasan"` is
preferred wording) as a follow-up; it does not indicate a real localization
gap and did not block this GO.

## Post-GO operator follow-ups

- Change the one-time `ops@nusa.business` password after first login (carried
  over from the prior GO if not already done).
- Search Console / property verification (C11).
- Isolated C07 restore drill into a scratch volume (non-production directory).
- Fix the stale `"Nilai ulasan"` assertion in `scripts/live-public-check.sh`.
- Screen-reader pass (C10) and RUM (C12) remain non-blocking.

None of these block this GO.

## Flip to GO

This page is **GO** because:

- Operator gates 1–6 are checked on the VPS
- `main` at `a2c93bc` authorized and deployed (Compose `scripts/deploy-vps.sh`),
  after fixing a Docker-build-only regression (#90) that blocked the first
  attempt at `8491232` without any live impact
- `bash scripts/live-public-check.sh` is 37/38 (no resolver jargon on `/` or
  `/id`; listing `/id` is Indonesian chrome; sitemap lists nested hosts, not
  `/host/bali`; robots Disallow `/search`; the one failure is a stale check
  assertion, not missing localization — see above)
- A human authorized deploy of SHA `a2c93bc67b2f426645f1f295e59d9f61bebd9f6e`
  ("please deploy main")
