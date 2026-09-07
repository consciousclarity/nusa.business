# Monetization & passive income

| Field | Value |
|---|---|
| Status | `exploring` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [roadmap Phase 6 packages](../product/roadmap.md), [features-parity — Paid packages](../features-parity.md), [overview — free / 0% commission](../product/overview.md), [ADR-003 Mercur](../architecture/adr/003-marketplace-mercur.md), [verification](./2026-09-07-listing-verification.md), [complete listing](./2026-09-07-complete-listing-profile.md) |

## Problem / itch

Owner wants the site to **generate money**, ideally **passive**. Constraint from product non-negotiables: **free listings** and **0% marketplace commission at launch** unless an ADR changes that. Monetization must not trash the fast text-first UX or turn Verified into a sold fake badge.

## Notes from chat

- 2026-09-07: “monetize the website… money generates passive income.”
- Roadmap already has **Paid packages** (Phase 6) as planned; commission default remains 0%.
- Passive ≠ zero work forever — means revenue that renews with little per-transaction labor once systems exist (subscriptions, affiliates, sponsorships).

## Guardrails

1. Keep basic listing free (field + claim path stays open).
2. Do not sell `Verified` without the continuous trust loop (or trust dies).
3. Prefer owner/tourism-board money over visitor paywalls (SEO directory).
4. Ads that inject third-party JS/images fight the teletype performance budget — last resort.
5. Changing 0% commission needs an explicit ADR.

## Ideas ranked (fit × passivity)

### A — Owner SaaS packages (best default) — **high passive once sold**
Recurring monthly/yearly for claimed owners. Free tier stays. Paid unlocks *distribution*, not existence:

- Featured slot on place / island index (text pin, not banner hell)
- Extra categories / multi-place presence
- Booking URL + social fields highlighted / completeness coaching
- Faster claim review / priority support
- Optional: SMS/WA “listing still correct?” nudge automation (helps verification)

Fits Phase 6. Closest to classic directory ARPU. **Lean here.**

### B — Place / island sponsorships — **medium–high passive**
B2B: hotels, tourism offices, cooperatives, villa groups pay for:

- Sponsored row on a place hub (“Partner”)
- Seasonal campaign block (still text/link style)
- Annual island underwriter

Fewer customers, larger checks; sales is less passive until you have renewals.

### C — Affiliate on outbound booking links — **high passive if automated**
When listing has `bookingUrl`, prefer partnerized OTAs / booking tools where legal. Directory stays free; take affiliate cut on click→book. Needs disclosure. Aligns with complete-profile `bookingUrl`. Zero commission on *your* marketplace can stay.

### D — Lead / contact credits — **medium passive, brand risk**
Charge for unlocked WhatsApp or “request quote” after N free contacts/month. Works on marketplaces; can feel extractive for warungs. Soft version: free WA deep link forever; paid = CRM inbox / lead log in portal (Phase 6 messaging).

### E — Geo white-label / “powered by Nusa” — **high ticket, semi-passive**
Charge kabupaten / island orgs for a branded host skin + managed directory. Recurring ops fee. Fits nested hosts. Sales-heavy early.

### F — Field-agent territory license — **active income dressed as product**
Agents pay for territory tools / quotas; or reverse: you pay agents and monetize owners. Not passive for you unless agent fees are subscription SaaS.

### G — Data / API for tourism & maps partners — **passive later**
Anonymized place demand, category trends. Needs scale + privacy. Park until Postgres phase.

### H — Display ads (AdSense etc.) — **passive but poor fit**
Conflicts with speed, no-images stance, and archive aesthetic. Only if desperate and heavily constrained.

### I — Marketplace commission later — **ADR required**
Raise `commissionPercent` above 0% only with product decision. Not launch path; not “passive” until checkout volume exists.

## What “passive” looks like for Nusa (realistic)

| Stage | Money motion |
|---|---|
| Now → traction | Almost no passive; build inventory + verification trust |
| Packages live | Recurring owner fees = main passive engine |
| Sponsors + affiliates | Top up with low-touch renewals |
| Commission (maybe never) | Only if marketplace volume justifies ADR |

## Options (packaging)

- **1 — Packages-first** — ship A; keep listings free; 0% commission.  
- **2 — Packages + affiliate booking links** — A + C.  
- **3 — Packages + place sponsors** — A + B for Bali tourism money.  
- **4 — Pay-for-leads** — D; higher friction with free ethos.

**Lean:** **3** long-term, **1** to ship first (Phase 6), add C when `bookingUrl` is real.

## Open questions

- Who pays first in Bali: villa/warung owners, or tourism boards / hotels?
- Is selling *placement* OK if Verified stays earned-only?
- Soft paywall on portal CRM vs any fee on public WA links?

## Next step

Owner picks packages-first vs sponsors-first; then sketch package tiers (Free / Featured / Pro) into a short ADR when ready to build Phase 6.
