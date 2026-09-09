# ADR-005: Two-level Indonesia category taxonomy

- **Status:** Accepted  
- **Date:** 2026-09-09  

## Context

The MVP used ten flat English buckets (`Accommodation`, `Food & Drink`, …). Discovery, field registration, and SEO need an Indonesia-shaped tree (warung, kos, bengkel, PPAT, catering) without duplicating services that already live in another group.

Owner supplied a 17-group catalog. Events & Weddings must surface catering, photography, makeup, florists, and cakes as **related services**, not second copies of those leaves.

## Decision

- Canonical catalog lives in `@nusa/shared` (`TAXONOMY`).
- Listings store **slugs**. Writes accept slug, English label, or a legacy MVP label and canonicalize.
- Groups are browse/filter buckets; leaves are the usual assignable types. A group query matches the group, its children, and any `related` slugs.
- Related entries point at leaves owned by another group. They never appear as children of Events & Weddings.

## Consequences

- `/v1/meta/categories` returns `{ categories, taxonomy }` (`categories` remains the flat label list).
- Existing JSON stores are rewritten on boot (`2026-09-canonicalize-category-slugs`).
- Place-hub `?category=` 301s to `/c/{slug}`. Facet browse lives at `/c/{category}` and allowlisted `/c/{category}/{facet}/{value}` ([ADR-006](./006-indexable-facet-urls.md)).
