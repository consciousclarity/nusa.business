# Listing discovery: same address, similar, nearby map

| Field | Value |
|---|---|
| Status | `exploring` — MVP on listing page |
| Captured | 2026-09-08 |
| Updated | 2026-09-09 |
| Related | [roadmap Maps](../product/roadmap.md), listing record page, lat/lng on `Business` |

## Problem / itch

On a business record, visitors should discover:

1. **Other businesses at this address** (mall / ruko / shared compound).
2. After the description: **up to 10 similar businesses within 2 km**.
3. Below that: **main categories** to pick; beside/under a **map of the same set** within 2 km for that category (e.g. pick a category → list + map update together).

## UX (record page)

```text
[ record header / kv / CTAs ]
[ Overview description ]
[ Other businesses at this address ]   ← only if match
[ Similar businesses within 2 km ]     ← shared categories, ≤10
[ Nearby by category ]
   category chips | map (same businesses as list)
   numbered index list
```

Map and list always show the **same** nearby results for the active category. No orphan markers.

## Rules

- Same address: normalize string equality (trim, case, whitespace); require non-empty address.
- Distance: haversine; origin = listing `lat`/`lng`. If missing coords, omit geo sections.
- Similar: overlap ≥1 category with current listing, exclude self and same-address block, sort by distance, cap 10, radius 2 km.
- Nearby-by-category: all listed businesses in radius with that category; default chip = first category of current listing that has neighbors, else first available nearby category.
- Teletype: text lists; map is a progressive island (Leaflet tiles). Label map region; keep claim/review/booking free of map chrome.

## Implementation sketch

- `GET .../businesses/:slug/discovery?category=&radiusKm=2`
- Seed Bali coords so Gianyar cluster demos co-location + 2 km.
- Public page SSR sections + small client script to refetch discovery on category change and sync markers.
- Live VPS listings created before seed pins have no `lat`/`lng`, so discovery `origin` is null until Warden runs [backfill-listing-coords.md](../ops/backfill-listing-coords.md). Do not re-seed production.
