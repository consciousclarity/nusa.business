# Launch readiness

Inspected against `main` at `bfd899c` (2026-09-09). C01–C14 already
landed (PRs #23–#39); this page records what the follow-up PR verified in
**code**, what still needs a **Hermes/Warden operator** on the VPS, and what
remains unverified because it needs live HTTPS or field data.

Local HTTP checks (synthetic seed, not production): homepage search,
`/search?q=`, listing contact actions, booking past-date 400 and duplicate 409.
`npm test` and `npm run seed` passed in this PR. Do not treat that as a live
HTTPS pass.

Cursor agents must not deploy or mutate production without explicit
authorization. Long-running on-box work belongs to **Warden** (Hermes on the
VPS) — see [hermes-vps-notes-2026-09-07.md](./hermes-vps-notes-2026-09-07.md)
and the operator list below.

## Findings (verified in this repo)

| ID | Evidence | Severity | Files | Fix in this PR | Verification |
|---|---|---|---|---|---|
| F01 | Production bootstrap already refuses demo seed; portal prefills only in Vite `DEV`. README still listed passwords. | P0 (docs) | `README.md`, `docs/features-parity.md` | Point public docs at local-only bootstrap; keep passwords in getting-started / AGENTS for local agents | `tests/db.bootstrap.test.mjs` (existing) + doc review |
| F02 | Live listing HTML (2026-09-09 GET `https://gianyar.bali.nusa.business/babi-guling-pande-egi`) uses `https://api.nusa.business`, not `http://api:8787`. Browser origin still fails closed in production builds. Live **homepage** still shows the old resolver chrome until this PR deploys. | P0 (ops) | `packages/shared/src/api-origins.ts` | Code already closed; operator must deploy this PR for visitor chrome | Live GET + `tests/shared.api-origins.test.mjs` |
| F03 | Review/booking widgets already checked `res.ok`, busy flags, and kept fields on failure. | P0 (done earlier) | listing `[...path].astro` | Unchanged behaviour; report form added with the same pattern | `tests/web.booking-form.test.mjs` |
| F04 | Bookings ignored client prices but accepted past dates and duplicate pending rows. No inventory calendar exists. | P0 | `apps/api/src/validate.ts`, `app.ts` | Reject past dates, require rental `endDate` / event `tickets`, 409 duplicate pending | `tests/api.validate.test.mjs`, `tests/api.write-security.test.mjs` |
| F05 | Claims already stay pending until admin approve; PATCH is owner/admin. Register was invite-only, so a new owner could not complete onboarding. | P0 | API register + portal `/register` | Public owner self-signup; clients cannot set `role`; pending claim still 403 on PATCH | `tests/api.onboarding-claims.test.mjs` |
| F06 | Public pages still showed host-resolver jargon (`kind=nation`, `published`, `/host/…` footer). | P1 | `apps/web` | Search-first home, listing contact actions, legal footer | `tests/web.visitor-chrome.test.mjs` |
| F07 | Seed catalog is sample data with no public stamp. | P1 | `packages/db`, listing UI | `sample: true` on seed businesses; stamp in UI | seed + visitor chrome |
| F08 | No correction/abuse report path. | P1 | API + listing | `POST /v1/businesses/:id/reports` | `parseReportBody` tests |
| F09 | No CSP header. | P1 | `apps/web/src/middleware.ts` | Report-Only CSP on public HTML | middleware source + perf header tests |
| F10 | `GET /v1/host` was a public debug dump. | P1 | `apps/api/src/app.ts` | 404 in `NODE_ENV=production` | source + non-prod still works |
| F11 | Header led with Claim/Portal; nearby HTML JSON dumped full listing objects including `bookingMode`. Place-hub “just registered” looked for leaked agent ids and never showed. | P1 | `Base.astro`, `apps/api/src/public.ts`, `PlaceDirectory.astro` | Search-first header; directory cards; slim `data-initial`; `fieldRegistered` flag | `tests/web.visitor-chrome.test.mjs`, `tests/api.public-privacy.test.mjs` |

### Assumptions (not treated as proven bugs)

- Live `nusa.business` homepage (2026-09-09 GET) still has `kind=nation` resolver chrome and `/host/…` footer — this PR’s visitor chrome is **not deployed**.
- Live listing HTML already embeds `https://api.nusa.business` (not `http://api:8787`). Hermes should still confirm env after deploy.
- Live `.data/store.json` may still contain seed emails — **unverified**. Dry-run in [demo-bootstrap.md](./demo-bootstrap.md).
- Process supervisor is PM2 vs Compose — Hermes 2026-09-07 saw PM2.

## Operator / Hermes (VPS) — authorized only

Do **not** run these from Cursor. Hand to Warden:

1. Record `git rev-parse HEAD` under `/opt/nusa.business`.
2. Confirm supervisor (PM2 **or** Compose), API bind, and env:
   `PUBLIC_BROWSER_API_URL=https://api.nusa.business`,
   `NUSA_SSR_API_URL` loopback/internal, `NUSA_AUTH_SECRET` set,
   `NUSA_ALLOW_DEMO_SEED` unset.
3. Inventory store users vs seed emails (redacted). If a row is confirmed demo (known password, no real ownership): backup `store.json`, disable/remove, rotate `NUSA_AUTH_SECRET`.
4. After this PR is merged and a human authorizes deploy: backup store, deploy, curl listing HTML and assert it does **not** contain `http://api:8787`.
5. Restore-test a store backup in an isolated directory (not production).
6. Search Console: submit `https://nusa.business/sitemap.xml` (operator).

## Launch checklist

Status key: **pass** (this PR or earlier tests) · **fail** · **unverified** (needs staging/VPS).

| Item | Status | Notes |
|---|---|---|
| Production cannot auto-create demo users | pass (code) | Live store inventory unverified |
| Public docs do not present demo passwords as production logins | pass | Local table remains in getting-started |
| Browser API origin fails closed in production builds | pass (code + live listing HTML) | Live homepage still old chrome; env re-check after deploy |
| Reviews check HTTP status; keep text on failure | pass | Not submitted to production |
| Bookings reject past dates, bad quantities, duplicates | pass (code) | No priced inventory yet — request-only |
| Claim does not grant edit until approved | pass (API tests) | Owner self-register + invite; pending PATCH 403 |
| Owners cannot PATCH another listing | pass | `tests/api.authz-cors.test.mjs` (incl. field agent) |
| Visitor pages omit resolver jargon | pass (this branch) | Live homepage still has `kind=nation` until deploy |
| Header Search first; Claim secondary | pass (this branch) | Portal remains in the footer |
| Homepage search + shareable `/search?q=` | pass | Category filter in the same query URL |
| Listing Directions / Call / Website / WhatsApp | pass | Seed website on one listing; maps from lat/lng |
| Nearby HTML/JSON omits `bookingMode` | pass (this branch) | Listing detail still exposes `bookingMode` for the request form |
| Field “just registered” without agent ids | pass (this branch) | `fieldRegistered` on public cards |
| Sample listings labelled | pass (local seed) | Production must not publish this catalog |
| Privacy / terms / support pages | pass | Legal text is launch-minimum, not counsel-reviewed |
| CSP Report-Only | pass (code) | No report URI yet; unverified in browsers |
| CORS restricted to `*.nusa.business` | pass (C06) | |
| Sitemap / robots | pass (C11 + search noindex) | Search Console unverified |
| WCAG 2.2 AA on phone | unverified | C10 chrome tests pass; no screen-reader run here |
| Lighthouse / RUM | unverified | C12 lab budget in CI; no field data |
| Staging e2e owner onboarding | unverified | Local API self-register + pending-claim PATCH 403 pass; staging HTTPS unverified |
| Error tracking / alerts | fail | Not implemented |
| DB backup restore drill | unverified | Operator |
| Dependabot / npm audit in CI | fail | Listed in security backlog |

**Release decision remains HOLD** until operator gates in
[release-decision.md](./release-decision.md) are checked.
