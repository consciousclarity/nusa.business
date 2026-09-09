# Indonesia-first category taxonomy

| Field | Value |
|---|---|
| Status | `done` |
| Captured | 2026-09-07 |
| Updated | 2026-09-09 |
| Related | [ADR-005](../architecture/adr/005-category-taxonomy.md), [`TAXONOMY` in `@nusa/shared`](../../packages/shared/src/taxonomy.ts), [product overview](../product/overview.md), [tutti research — Swiss only](../research/README.md) |

## Problem / itch

Category research must stay **Indonesia / Nusa-shaped**: nested geo local-business directory (warung, villa, spa, tour, bengkel…), not a Swiss classifieds / flea-market tree.

Owner correction (2026-09-07): do not use tutti.ch as the model — it is a Swiss platform. Keep that dump as optional research only.

## Decision (2026-09-09)

Option **B** — two-level tree, 17 groups, English labels + kebab slugs. Events & Weddings links catering, photography, makeup, florists, and cakes as related services (canonical leaves stay in Food & Drink / Creative / Beauty / Shopping). Promoted to [ADR-005](../architecture/adr/005-category-taxonomy.md).

## Notes from chat

- Existing MVP categories (flat, EN): Accommodation, Food & Drink, Health & Wellness, Tourism & Experiences, Shopping & Retail, Arts & Culture, Professional Services, Sports & Recreation, Beauty & Personal Care, Home & Construction.
- Product is directory + optional vendor shop, WhatsApp-first contact, speed / no-images stance — taxonomy should serve **discovery of places to go / people to hire**, not second-hand SKUs.
- Indonesian references worth comparing later: OLX Indonesia (closer to classifieds), Google Business / Maps types, Tokopedia/Shopee (e‑commerce — weaker fit), bali.business prototype categories, BPS / common tourist+local service buckets.

## Options (if any)

- **A — Grow current Nusa list** — keep flat EN list; add ID labels + a few missing buckets (e.g. Transport, Education, Religion/community) when seed needs them.
- **B — Two-level Indonesia tree** — parent (Food & Drink) → children (Warung, Café, Fine dining, Catering) with `en`/`id` labels; still business-typed.
- **C — Mirror an ID marketplace taxonomy** — higher risk of classifieds skew; only if owner picks a specific source.

## Open questions

- Indonesian labels (`id`) for the same slugs — not in this catalog dump.
- Religion/community bucket still absent from the owner tree.

## Next step

Living catalog is `@nusa/shared` `TAXONOMY`. Further edits go there + ADR-005 if the shape changes.
