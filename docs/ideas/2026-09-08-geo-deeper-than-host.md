# Going deeper than place.island hosts

| Field | Value |
|---|---|
| Status | `exploring` |
| Captured | 2026-09-08 |
| Updated | 2026-09-08 |
| Related | [ADR-002 hybrid places](../architecture/adr/002-hybrid-places.md), [geography](../product/geography.md), [tenancy](../architecture/tenancy.md), `parseHost` (at most 2 labels) |

## Problem / itch

Host depth stops at `{place}.{island}.nusa.business` (e.g. `jakarta.java.nusa.business`). Owner asks how to go **deeper** (neighborhood, street, village, category) without breaking DNS/TLS and the sacred host grammar.

## Constraint (today)

`parseHost` accepts only nation / island / place. A third label (`menteng.jakarta.java.nusa.business`) → `unknown`. Tests pin this. Deeper geography must use **data + paths/filters**, not more subdomain labels — unless a future ADR extends the host grammar.

## Three ways to go deeper (recommended order)

### A — Sibling places + `parentPlaceId` (already designed)

Keep **one host label per place**. Nest in the **database**, not DNS.

```text
java.nusa.business
 └── jakarta.java.nusa.business          (kota)
      └── (parent link) menteng …        also menteng.java.nusa.business (area)
      └── (parent link) kebayoran …      kebayoran.java.nusa.business
```

- Both Jakarta and Menteng are `Place` rows on island `java`.
- Menteng has `parentPlaceId → jakarta`.
- Each gets its own SEO host: `menteng.java.nusa.business`.
- Place hub shows “Part of Jakarta” + child areas on the kota hub.

**This is the Nusa way.** Matches ADR-002 (Canggu under Badung, etc.). No TLS change.

### B — Path / section under the place host

Stay on `jakarta.java.nusa.business` and go deeper in the **path**:

| Deeper thing | Example URL |
|---|---|
| Neighborhood section | `jakarta.java…/areas/menteng` |
| Category facet | `jakarta.java…/c/food-drink` or `?category=` |
| Business | `jakarta.java…/warung-xyz` (already) |

Good when Menteng should **not** be a first-class host (thin content). Risk: thin auto-generated area pages — same scaled-content caution as monetization note.

### C — Fourth DNS label (not now)

`menteng.jakarta.java.nusa.business` would need:

- New `HostContext` kind + `parseHost` change  
- DNS `*.*.*.nusa.business` + harder TLS (on-demand / ACM)  
- Breadcrumb / `publicUrl` / middleware rewrites  

Only if product proves neighborhoods need apex-style hosts **and** A/B are not enough. Requires ADR.

## How Java / Jakarta should look (example)

| Layer | Host or path |
|---|---|
| Island | `java.nusa.business` |
| Kota | `jakarta.java.nusa.business` |
| Area (deeper) | `menteng.java.nusa.business` with `parentPlaceId=jakarta` **or** `/areas/menteng` on the kota host |
| Listing | `menteng.java…/slug` or `jakarta.java…/slug` |

Business still has **one** `placeId` (usually the most specific place visitors search).

## Anti-patterns

- Encoding category in the subdomain (`yoga.ubud.bali…`) — categories are facets, not places.  
- Infinite DNS depth for every RT/RW.  
- Duplicate thin hosts for the same cluster without canonical + parent links.

## Lean

**Use A for real named areas people search; use B for light subsections and categories; park C.**

## Open questions

- For Jakarta: first-class hosts for which areas (Menteng, Kebayoran, Kelapa Gading…)?  
- Can a business appear on parent kota hub when attached only to Menteng? (usually yes — roll-up query)

## Next step

When seeding Java: pick kota + area places with `parentPlaceId`; wire place hub “Part of / Areas in” UI. No parser change.
