# Launch readiness

Inspected against `main` at `bfd899c` (2026-09-09). C01–C14 already
landed (PRs #23–#39). This follow-up PR (booking rules, visitor chrome,
Indonesian `/id` labels including island names, HTML 404/500, portal
demo-bundle grep) verified those items in **code**. It is **not** a live GO.

Cursor agents must not deploy or mutate production. Long-running on-box
work belongs to **Warden** (Hermes on the VPS) — see
[hermes-vps-notes-2026-09-07.md](./hermes-vps-notes-2026-09-07.md).

## Remaining before GO

Three columns. Do not treat a **code** pass as a live pass.

| Kind | Item | Evidence / who |
|---|---|---|
| **Code (this PR)** | P0 booking/authz/demo + visitor `/id` chrome (F01–F26) | `npm test` + findings table below. Not on the VPS until deploy. |
| **Fail (live HTTPS)** | Homepage `/` and `/id` still have resolver jargon and no `name="q"`. Listing `/id` still shows English `Food & Drink`, `Address`, `Host`/`Status`/`Booking` dts, and English weekdays. | `bash scripts/live-public-check.sh` (25 fails until this PR deploys). Listing API origin already ok. |
| **Operator only** | VPS SHA, PM2 vs Compose, `PUBLIC_BROWSER_API_URL` / `NUSA_SSR_API_URL`, `NUSA_AUTH_SECRET`, demo-store inventory, store backup + isolated restore, Search Console sitemap submit | [release-decision.md](./release-decision.md) gates 1–6. Cursor must not run these. |
| **Not this launch** | Priced booking inventory, cookie sessions/CSRF, error tracking, RUM, WCAG AA screen-reader, Dependabot/`npm audit` CI | Security / parity backlog. Do not block GO on these unless product says so. |

Local HTTP on synthetic seed (`/host/…`, booking 400/409) is not a live HTTPS pass.

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
| F12 | Listing review/booking/shop chrome was English-only; booking success dumped request id and `status`. | P1 | listing `[...path].astro`, `i18n/ui.ts` | Locale copy for listing widgets; success message is visitor notice only | `tests/web.visitor-chrome.test.mjs` |
| F13 | `/support` still said owner registration was invite-only after self-signup shipped. Privacy/terms/support bodies were English-only. Opening-hour days stayed `Mon` on `/id`. | P0/P1 | `support.astro`, legal pages, listing hours | Support describes free owner accounts; legal pages use `t()`; weekday labels | `tests/web.visitor-chrome.test.mjs` |
| F14 | `/id` category chips and filters used English taxonomy labels (`Banks & ATMs`). | P1 | `packages/shared` taxonomy-id + public pages | `categoryLabel(slug, locale)`; browse headings use `inWhere` | `tests/shared.taxonomy.test.mjs`, `tests/web.visitor-chrome.test.mjs` |
| F15 | `/id` category browse filters used English facet keys (`Price level`, `Service mode`). | P1 | `packages/shared` facets-id + CategoryBrowse | `facetKeyLabel` / `facetValueLabel(..., locale)` | `tests/shared.facets.test.mjs` |
| F16 | `/id` listing JSON-LD `additionalType` used English taxonomy labels (`Food & Drink`). | P1 | `packages/shared/src/seo.ts`, listing `[...path].astro` | `localBusinessJsonLd` takes `locale`; `inLanguage` + Indonesian `additionalType` | `tests/web.seo.test.mjs` |
| F17 | Sitemap listed English `/host` paths only; `/id` pages existed with hreflang but were not submitted. | P1 | `sitemap.xml.ts`, `localeSitemapPaths` | Emit `/id` counterparts; `og:locale` + `hreflang="x-default"` | `tests/web.seo.test.mjs`, `tests/web.visitor-chrome.test.mjs` |
| F18 | `/id` listing forms showed English API `error` strings and the English booking `notice`. Missing tenant routes returned an empty 404 body. | P1 | listing widgets, `404.astro`, booking `code` | Localized `visitorError` + codes; HTML 404 with search | `tests/web.visitor-chrome.test.mjs`, `tests/api.validate.test.mjs` |
| F19 | Listing JSON-LD omitted opening hours even when the page showed them. | P1 | `localBusinessJsonLd` | `openingHoursSpecification` from listing hours | `tests/web.seo.test.mjs` |
| F20 | Unknown island/place hubs threw API errors (500). Public booking POST returned the full booking row (id, email, status). | P0/P1 | island `index.astro`, `POST /v1/businesses/:id/bookings` | `apiOrNull` + HTML 404; `{ ok: true }` without `booking` | `tests/web.visitor-chrome.test.mjs`, `tests/api.write-security.test.mjs` |
| F21 | Nation homepage called `publicUrl` without importing it. Local `/host` paths worked; production `nusa.business` island links would throw. | P0 | `apps/web/src/pages/index.astro` | Use `tenantHref` for island links | `tests/web.visitor-chrome.test.mjs` |
| F22 | Nation homepage and `/search` threw when `/v1/islands` was down, so the search form never rendered. No HTML 500. | P1 | `apiTry`, `index.astro`, `search.astro`, `500.astro` | Homepage/search degrade with a notice; other SSR throws use HTML 500 | `tests/web.visitor-chrome.test.mjs` |
| F23 | `/id` island taglines were English seed copy. Category/facet browse threw when `/v1/search` failed. | P1 | `islandTagline`, `CategoryBrowse`, browse pages | Indonesian island ledes; browse uses `apiTry` + noindex when search is down | `tests/web.visitor-chrome.test.mjs`, `tests/web.facet-browse.test.mjs` |
| F24 | Portal login embeds demo passwords in source. Vite DCE must keep them out of the production JS bundle. | P0 | `LoginPage.tsx`, portal `dist/` | Prefill only in `DEV` / `VITE_NUSA_DEMO_LOGIN`; CI greps production assets | `tests/portal.production-bundle.test.mjs` |
| F25 | `/id` island names used English seed copy (`Java`, `Sumatra`) while category labels were already localized. | P1 | `islandName`, homepage/search/hubs/listing crumbs | Indonesian island names (`Jawa`, `Sumatera`); seed/API name stays English | `tests/web.visitor-chrome.test.mjs`, `scripts/live-public-check.sh` |
| F26 | Listing/hub canonical + JSON-LD breadcrumbs used `hostPath` + `absoluteUrl`, so nested hosts emitted `/id/host/bali`. | P1 | `tenantAbsHref`, listing/hub/facet pages | Public canonical/JSON-LD use `tenantHref` (real hosts in production, `/host` locally) | `tests/web.visitor-chrome.test.mjs` |

### Assumptions (not treated as proven bugs)

- Live `nusa.business/` and `/id` (2026-09-09 GET) still have `kind=nation` resolver chrome and `/host/…` footer — this PR’s visitor chrome is **not deployed**. Live `/id` also lacks the search field (`name="q"`).
- Live `/id` listing (2026-09-09 GET `…/id/babi-guling-pande-egi`) still shows English `Food & Drink`, `Address`, `Status published`, and `Mon` weekdays because this PR is not deployed.
- Live listing HTML already embeds `https://api.nusa.business` (not `http://api:8787`). Hermes should still confirm env after deploy.
- Live `.data/store.json` may still contain seed emails — **unverified**. Dry-run in [demo-bootstrap.md](./demo-bootstrap.md).
- Process supervisor is PM2 vs Compose — Hermes 2026-09-07 saw PM2.

## Operator / Hermes (VPS) — authorized only

Do **not** run these from Cursor. Hand to Warden. After deploy, an
authorized operator can run the read-only public check from anywhere:

```bash
bash scripts/live-public-check.sh
```

That script does not SSH or mutate the VPS. It currently **fails** until this PR is deployed:

- homepage `/` and `/id`: `class="resolver"`, `kind=nation`, `/host/bali`, no `name="q"`, no `nav-search`
- homepage `/id`: missing `Pulau Dewata`, `Cari bisnis`, `Jawa`
- listing `/id`: English `Food & Drink`, `Address`, `Status published`, `Booking none`, `Review scores`, `Mon 09:00` instead of `Makanan & minuman` / `Alamat` / `Sen 09:00`

EN listing HTML already passing `http://api:8787` / `https://api.nusa.business`
is not a substitute for homepage visitor chrome or `/id` chrome.

On the VPS:

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
| Production portal bundle omits demo passwords | pass (this branch) | `tests/portal.production-bundle.test.mjs`; CI builds portal before `npm test` |
| Public docs do not present demo passwords as production logins | pass | Local table remains in getting-started |
| Browser API origin fails closed in production builds | pass (code + live listing HTML) | Live homepage still old chrome; env re-check after deploy |
| Live homepage visitor chrome | fail (live) | EN and `/id` (2026-09-09): `class="resolver"`, `kind=nation`, `/host/bali`, no `name="q"` |
| Nation homepage island links on `nusa.business` | pass (this branch) | `tenantHref`; unbound `publicUrl` removed |
| Reviews check HTTP status; keep text on failure | pass | Not submitted to production |
| Bookings reject past dates, bad quantities, duplicates | pass (code) | No priced inventory yet — request-only |
| Claim does not grant edit until approved | pass (API tests) | Owner self-register + invite; pending PATCH 403 |
| Owners cannot PATCH another listing | pass | `tests/api.authz-cors.test.mjs` (incl. field agent) |
| Visitor pages omit resolver jargon | pass (this branch) | Live homepage still has `kind=nation` until deploy |
| Header Search first; Claim secondary | pass (this branch) | Portal remains in the footer |
| Homepage search + shareable `/search?q=` | pass | Category filter in the same query URL |
| Listing Directions / Call / Website / WhatsApp | pass | Seed website on one listing; maps from lat/lng |
| Nearby HTML/JSON omits `bookingMode` | pass (this branch) | Listing detail still exposes `bookingMode` for the request form |
| Listing review/booking/shop chrome i18n | pass (this branch) | `/id` listing widgets; listing body still author language |
| Category labels on `/id` | pass (this branch) | Taxonomy Indonesian labels; English remains canonical for slugs |
| Facet key/value labels on `/id` | pass (this branch) | Browse filters and path-facet headings; English remains canonical for slugs |
| JSON-LD `additionalType` on `/id` | pass (this branch) | Indonesian labels + `inLanguage`; listing body still author language |
| Sitemap includes `/id` URLs | pass (this branch) | English + `/id` locs; Search Console submission still operator |
| `og:locale` / hreflang x-default | pass (this branch) | `en_GB` / `id_ID`; x-default is English |
| Listing form errors localized | pass (this branch) | Codes mapped in widgets; English API `error` not shown |
| Public HTML 404 | pass (this branch) | Search + home; unknown island/place hubs too |
| Homepage/search if the API is down | pass (this branch) | `apiTry`; search form still renders; island list shows a notice |
| Public HTML 500 | pass (this branch) | Search + home; hubs still 500 (not 404) when the API is down |
| Island taglines on `/id` | pass (this branch) | `islandTagline`; seed/API tagline stays English |
| Island names on `/id` | pass (this branch) | `islandName`; `Java`/`Sumatra` → `Jawa`/`Sumatera`; hostname slugs stay English |
| Listing/hub canonical JSON-LD on nested hosts | pass (this branch) | `tenantAbsHref`; production must not emit `/host/bali` in listing JSON-LD |
| Category browse if search is down | pass (this branch) | Notice + `noindex`; not a 500 and not a fake empty index |
| Public booking POST omits booking row | pass (this branch) | `{ ok: true }` only; owners still GET `/v1/bookings` |
| JSON-LD opening hours | pass (this branch) | `openingHoursSpecification` when hours exist |
| Booking success omits request id/status | pass (this branch) | Visitor notice only; not submitted to production |
| Field “just registered” without agent ids | pass (this branch) | `fieldRegistered` on public cards |
| Sample listings labelled | pass (local seed) | Production must not publish this catalog |
| Privacy / terms / support pages | pass | Legal text is launch-minimum, not counsel-reviewed; `/support` is owner self-register, not invite-only |
| Support does not say invite-only | pass (this branch) | Owners self-register; agents/admins remain invite-only |
| CSP Report-Only | pass (code) | No report URI yet; unverified in browsers |
| CORS restricted to `*.nusa.business` | pass (C06) | |
| Sitemap / robots | pass (C11 + search noindex) | Search Console unverified |
| Live public HTTPS smoke | fail (homepage + listing `/id`) | Script is read-only; EN listing API origin already ok; homepage chrome and `/id` visitor labels wait on deploy |
| WCAG 2.2 AA on phone | unverified | C10 chrome tests pass; no screen-reader run here |
| Lighthouse / RUM | unverified | C12 lab budget in CI; no field data |
| Staging e2e owner onboarding | unverified | Local API self-register + pending-claim PATCH 403 pass; staging HTTPS unverified |
| Error tracking / alerts | fail | Not implemented |
| DB backup restore drill | unverified | Operator |
| Dependabot / npm audit in CI | fail | Listed in security backlog |

**Release decision remains HOLD** until operator gates in
[release-decision.md](./release-decision.md) are checked.
