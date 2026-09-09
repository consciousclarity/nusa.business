# ADR-006: Indexable category facet URLs

- **Status:** Accepted  
- **Date:** 2026-09-09  

## Context

Directory filters (cuisine, dietary, beachfront, 24-hour, rental type, …) are
valuable for searchers, but indexing every combination would create thousands of
thin duplicate pages.

Location is already the nested host (`gianyar.bali` / `/ubud`). Extra filters
must not explode the URL space.

## Decision

Path grammar:

```text
/{area?}/c/{category}
/{area?}/c/{category}/{facet}/{value}
```

Dev: `/host/{label}/…`. Production: same path on the tenant host.

**Index** (`index,follow`) only when:

1. The path is category-only **or** exactly one allowlisted `(category, facet, value)` pair, and
2. The result set has ≥1 listing, and
3. There are no extra facet query parameters.

**Allowlist** lives in `@nusa/shared` `INDEXABLE_FACET_PATHS` (conservative:
Balinese/Indonesian/Javanese cuisine, halal/vegetarian/vegan, beachfront hotels,
24-hour pharmacies, scooter/car rental type, breakfast/brunch, core activities).

Everything else stays on the **query string**, gets `noindex,follow`, and a
`rel=canonical` pointing at the category page or the allowlisted path.

A single allowlisted query pair **301s** onto the path
(`/c/restaurants?dietary=halal` → `/c/restaurants/dietary/halal`).
Legacy hub `?category=` **301s** to `/c/{slug}`.

The sitemap emits only indexable paths that currently have results.

## Consequences

- Listings store `facets?: Record<string, string[]>`. Distance, open-now, rating,
  and claimed-listing are computed at query time; geo location is the host.
- `/v1/search` accepts facet keys as repeated query params.
- Arbitrary combos remain usable in the UI without becoming crawlable pages.
