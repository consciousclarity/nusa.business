# Monetization & advertising (Nusa-adapted)

| Field | Value |
|---|---|
| Status | `exploring` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [geography / hosts](../product/geography.md), [teletype](../design/teletype.md), [roadmap Phase 6](../product/roadmap.md), [paid packages parity](../features-parity.md), [verification](./2026-09-07-listing-verification.md), [complete listing](./2026-09-07-complete-listing-profile.md), [overview — free / 0%](../product/overview.md) |

## Problem / itch

Turn nusa.business into durable revenue (as passive as possible) without breaking: free basic listings, 0% marketplace commission at launch, continuous verification integrity, or the fast text-first public surface.

Source notes (2026-09-07): classic directory ad formats (sponsored listings, category sponsors, native guides, AdSense) + earlier packages/affiliate brainstorm — **rewritten for Nusa’s nested hosts and teletype rules**.

## Guardrails (non-negotiable unless ADR)

1. **Free listing stays** — pay for *distribution / tools*, not existence.
2. **`Sponsored` ≠ `Verified`** — never sell the trust stamp; placement is labeled advertising.
3. **Disclose** every paid placement (`Sponsored` / `Partner`); paid links use `rel="sponsored"` where applicable.
4. **Teletype budget** — no pop-ups, interstitials, or ad JS in claim / login / review / booking flows; programmatic ads only late and sparse.
5. **0% shop commission** until an ADR says otherwise.
6. **No scaled thin category pages** — Google scaled-content abuse risk; every indexable URL needs distinctive value.

---

## 1. Most valuable formats (for Nusa)

### 1.1 Sponsored listings (primary)

Pin **2–3 paid businesses above organic** on a place hub or place×category view. Same teletype index row language — clearly stamped.

```text
Sponsored
Ocean View Diving — Gili Trawangan
Verified · WhatsApp · Directions · Website
```

Rules:

- Always show `Sponsored` (stamp style, like existing `.stamp`).
- Organic results continue immediately below; never mix unlabeled.
- Prefer claimed + complete profiles; Sponsored does **not** grant Verified.
- Cap inventory (e.g. max 3 per place or place×category) to keep the index honest.

**Suggested pricing (hypothesis — validate with Bali sales):**

| Slot type | Rp / month |
|---|---|
| Small place × niche category | 250k–500k |
| Popular commercial category (Food & Drink, Tourism) | 750k–2m |
| High-value (property, legal, weddings, healthcare, hospitality) | 2m–5m+ |

### 1.2 Exclusive place / category sponsorship

Sell the **lede / resolver-adjacent** line on a valuable hub — one exclusive advertiser:

```text
Ubud · Health & Wellness — Partner: [Brand]
```

Easier ops than dozens of micro-placements; higher monthly fee. Fits tourism boards, hospital groups, hotel brands. Still text — not a hero image banner.

### 1.3 Native sponsored guides (content)

Useful paid guides on nation/island hosts (or `/guides/…` under Astro), e.g.:

- Opening a business in Bali (practical, local)
- Choosing coworking in Canggu
- Moving to Lombok: banking, insurance, connectivity

Rules: genuinely useful editorial; disclose sponsor; outbound paid links `rel="sponsored"`. Do not gate basic directory SEO behind these.

### 1.4 Pro business subscriptions (packages)

Recurring portal SaaS (Phase 6) for claimed owners — complements ads:

| Tier (draft) | Gets |
|---|---|
| Free | Listing, claim, WA link, basic hours |
| Pro | Completeness tools, booking URL / social fields, analytics (WA clicks), renewal nudges |
| Featured | Pro + eligibility / included sponsored slot credits on home place |

**Do not** bundle “buy Verified.” Optional: Pro includes *easier* contact-challenge UX, not a fake badge.

### 1.5 Affiliate referrals

On guides and listing `bookingUrl` where legal: partner OTAs / tools. Directory shop commission stays 0%. Disclose affiliates.

### 1.6 Programmatic (AdSense etc.) — last layer

Truly passive, but needs traffic and fights performance/aesthetic.

Rough scenario (not a promise):

`revenue ≈ (pageviews / 1000) × RPM`

At 100k monthly PV: Rp15k RPM → ~1.5m; Rp50k → ~5m; Rp100k → ~10m. Actuals depend on geo, category, consent, viewability.

**Only after** organic scale. If ever:

- One unit after first organic block on long hubs  
- One mid-guide unit on sponsored/native guides  
- Optional desktop-only aside — **not** on teletype single-column by default (prefer skip sidebar)  
- **Never** in booking, review, login, claim, field register  
- No pop-ups / full-screen interstitials  

---

## 2. SEO page hierarchy (Nusa shape)

Canonical product hierarchy is **hosts**, not path soup:

```text
nusa.business
 └── {island}.nusa.business
      └── {place}.{island}.nusa.business
           └── /{business-slug}
```

Category is a **facet** on place/island (filter / future `?category=` or `/c/{slug}` under the place host — decide in ADR before inventing thousands of URLs).

Examples of *valuable* indexables:

| Page | Example |
|---|---|
| Island hub | `bali.nusa.business` |
| Place hub | `canggu.bali.nusa.business` |
| Place × category (only when content-rich) | `canggu.bali…` + Food & Drink filter/page |
| Business record | `…/slug` |
| Guide | `bali.nusa.business/guides/…` (or nation) |

**Every indexable page needs distinctive value:**

- Verified / completeness signals where earned  
- Useful filters  
- Hours + contact (WA / phone / website / booking)  
- Short original place or category intro (not boilerplate)  
- Pricing ranges only when reliable  
- FAQs from real visitor questions  
- Recently checked / continuous verification freshness  
- Genuine reviews  
- Internal links to related places & categories  

**Anti-pattern:** auto-generating empty `{place}×{category}` pages for the whole archipelago. Prefer **20–30 rich combos first** (Bali launch), then expand.

Dev note: `/host/{label}` mirrors production hosts; do not design SEO around WordPress-style `/bali/canggu/…` paths unless an ADR reintroduces them as aliases.

---

## 3. Ideal revenue mix (target)

| Share | Source |
|---|---|
| ~50% | Sponsored listings + exclusive place/category sponsors |
| ~25% | Pro / Featured subscriptions |
| ~15% | Affiliates |
| ~10% | Programmatic (late) |

Direct sponsorship usually beats AdSense on **modest local traffic**. Programmatic is background once SEO scale exists.

---

## 4. Rollout (recommended)

1. Ship **20–30** high-quality place (and select place×category) pages — Bali first.  
2. Measure: impressions, visits, WA clicks, calls, website / booking clicks.  
3. Sell sponsored slots with those numbers as proof.  
4. Automate purchase, renewal, expiry, reporting (portal).  
5. Add Pro subscriptions (Phase 6).  
6. Add affiliates inside relevant guides + booking URLs.  
7. Consider AdSense only when PV justifies teletype cost.

---

## 5. Lean decision

| Priority | Do |
|---|---|
| Now | Quality geo pages + metrics instrumentation |
| Next | Sponsored listings (capped, labeled) + exclusive hub partners |
| Parallel | Pro subscription design (Phase 6) |
| Later | Affiliates → programmatic |

**Park:** paywalling WhatsApp; selling Verified; marketplace commission without ADR.

## Open questions

- First sales motion: outbound to high-value categories in Ubud/Canggu/Gianyar, or inbound once metrics dashboards exist?
- Place×category as host query vs path — which ADR?
- Featured tier = included sponsored credits, or separate SKU?

## Next step

Lock “Sponsored listings + Pro” as Phase 6 money story; draft package SKUs and sponsor inventory rules into an ADR when ready to build billing.
