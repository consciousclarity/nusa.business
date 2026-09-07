# Indonesia-first category taxonomy

| Field | Value |
|---|---|
| Status | `exploring` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [`CATEGORIES` in `@nusa/shared`](../../packages/shared/src/index.ts), [product overview](../product/overview.md), [tutti research — Swiss only](../research/README.md) |

## Problem / itch

Category research must stay **Indonesia / Nusa-shaped**: nested geo local-business directory (warung, villa, spa, tour, bengkel…), not a Swiss classifieds / flea-market tree.

Owner correction (2026-09-07): do not use tutti.ch as the model — it is a Swiss platform. Keep that dump as optional research only.

## Notes from chat

- Existing MVP categories (flat, EN): Accommodation, Food & Drink, Health & Wellness, Tourism & Experiences, Shopping & Retail, Arts & Culture, Professional Services, Sports & Recreation, Beauty & Personal Care, Home & Construction.
- Product is directory + optional vendor shop, WhatsApp-first contact, speed / no-images stance — taxonomy should serve **discovery of places to go / people to hire**, not second-hand SKUs.
- Indonesian references worth comparing later: OLX Indonesia (closer to classifieds), Google Business / Maps types, Tokopedia/Shopee (e‑commerce — weaker fit), bali.business prototype categories, BPS / common tourist+local service buckets.

## Options (if any)

- **A — Grow current Nusa list** — keep flat EN list; add ID labels + a few missing buckets (e.g. Transport, Education, Religion/community) when seed needs them.
- **B — Two-level Indonesia tree** — parent (Food & Drink) → children (Warung, Café, Fine dining, Catering) with `en`/`id` labels; still business-typed.
- **C — Mirror an ID marketplace taxonomy** — higher risk of classifieds skew; only if owner picks a specific source.

**Lean (pending owner):** A or B, grounded in Bali launch + field-agent reality; ignore Swiss classifieds structure.

## Open questions

- Expand the current 10 categories, or design a proper parent/child tree for Indonesia?
- Primary language for category slugs/labels at launch: English, Indonesian, or both?
- Which Indonesian reference (if any) should we skim next: bali.business, OLX ID, Google Business types, something else?

## Next step

Owner picks expand-flat vs two-level tree (and optional ID reference). Then draft taxonomy in ideas → promote into `@nusa/shared` + seed when decided.
