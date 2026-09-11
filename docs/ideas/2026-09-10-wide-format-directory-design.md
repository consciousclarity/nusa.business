# Wide-format directory design

| Field | Value |
|---|---|
| Status | `decided` — phase one implemented, pending review/release |
| Captured | 2026-09-10 |
| Updated | 2026-09-11 |
| Related | [Visual rules](../design/teletype.md), [homepage structure](../design/homepage.md), [validation](../design/wide-directory-validation.md) |

## Problem and decision

The owner requested a more inviting, engaging wide-format directory using CSS
and JavaScript, preserving responsiveness, functionality and speed without
decorative images. The live review found a roughly 657px content column at
1280px, wrapped search controls and maps covering the page. Main already
contained newer typography and bounded map positioning than the live release.

Evolve the existing Astro public surface: warm paper/carbon themes, system
fonts, terracotta links, botanical actions, clear search and useful text rows.
Keep the reading measure separate from the wider directory shell. Preserve
nested hosts, crawl links, EN/ID routes, contact actions and all listing forms.

Phase one implements the wider layout and adds map containment. The owner
agreed to defer saved businesses, timezone-aware Open Now and a vector-map
replacement. Existing lazy raster maps remain in this phase. No new images,
fonts, animation library or client framework are introduced.

## Technology follow-ups

- **Keep Astro server rendering and CSS Grid/fluid type.** These deliver the
  layout without resize listeners or extra hydration. Native GET search keeps
  results shareable and available without JavaScript.
- **Saved businesses:** a nation-host shortlist or account-backed list needs
  an explicit cross-host design. `localStorage` alone cannot share saves across
  the province and place subdomains.
- **Open Now:** use each business's timezone, overnight/holiday hours and data
  freshness. Unknown hours must stay unknown; a stored availability tag is
  not a live opening-hours calculation.
- **Strict image-free maps:** assess an explicitly opened MapLibre vector
  map without raster sources or image sprites. Include data hosting,
  attribution, payload and fallback requirements; keep nearby text and
  external directions. It is not an automatic performance improvement.
- **View Transitions:** optional, feature-detected polish with reduced-motion
  support. Cross-document transitions apply only to supported same-origin
  navigation, so they cannot connect all geographic subdomains.
- **Search suggestions:** later, use a bounded endpoint with cancellation and
  debounce. Do not download the national catalog for client-side search.

References: [Astro islands](https://docs.astro.build/en/concepts/islands/),
[CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries),
[View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API),
[MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/).

## Production path

Review this branch and its validation, merge after CI, then authorize the exact
release SHA under the existing [release process](../ops/release-decision.md).
Deployment remains the current VPS/Compose workflow with a fresh store backup,
live checks and a recorded rollback SHA. A push or merge does not deploy.
