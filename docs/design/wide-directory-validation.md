# Wide directory validation — 2026-09-11

Baseline: `f65e63a0d39aea8033581b0edba19eaa877554b9` (main, including #63).
The redesign retains that commit's single-map listing and review-form cleanup.

## Build and regression checks

- Full workspace `npm run build`: passed.
- `npm test`: **274 passed, 0 failed**. The web build was repeated after the
  final nearby container-query change, followed by the full test suite.
- `NUSA_DATA_DIR=/tmp/nusa-release-seed npm run seed`: passed with an isolated
  demo store. Production data was never used for mutation tests.
- `git diff --check`: passed.
- The complete script blocks in `DirectoryMap.astro` and the listing page
  compare byte-for-byte equal to main. No package or lockfile changes.

## Browser checks

Checked the local Astro site against its isolated Hono API:

| Area | Result |
|---|---|
| Homepage at 320, 390, 768, 1024, 1440, 1920px | Search stacks / uses two columns / uses one row; no out-of-viewport content outside clipped map internals |
| Ultrawide shell | Capped at 1440px in a 1920px viewport; all 38 province links remain in HTML |
| Search | Query + Bali selection returned three results; province search retained `island=bali` |
| EN → ID | Search query and province retained; Indonesian headings, labels and listing forms render |
| Search states | Untouched search offers guidance; a nonmatching query displays the no-results state |
| API unavailable | Stopped the local API; homepage still rendered search, category links and the unavailable notice; restarted the API afterward |
| Category page at 320px | Filter controls and results stay inside the viewport |
| Listing at 320 / 390 / 1440px | Contact links, hours and forms remain usable; wide identity/contact columns and hours/nearby columns verified |
| Maps | Relative positioning and isolated bounds verified; nearby category selection updates; no duplicate location map after #63 |
| Local review / report / booking | Review persisted before upstream review-display removal; report returned its localized acceptance; booking returned pending-request feedback |
| Keyboard | Tab reveals the skip link with a visible 2px outline; Enter moves focus to `main-content` |
| Type / controls | 16px inputs and at least 44px main form buttons/inputs; light and dark layouts visually inspected |

Nearby layout now responds to its container width. Without container-query
support it keeps its usable stacked map/list layout. Reduced-motion and
focus rules also pass the repository checks. A screen-reader session,
multi-engine pass and 200% browser-zoom check were not completed here.

## Payload and local timing

Both production Astro builds used the same Node runtime, dependency lockfile
and local demo API. `PUBLIC_BROWSER_API_URL=https://api.invalid` was supplied
at build time for this read-only comparison; interactive form checks used the
separate dev server pointing to the isolated local API. Deployment must use
the real API origins documented in the release runbook.

Each route was fetched once to warm the server, then five times. The timings
below are medians to receive the full HTML body over loopback. Gzip sizes use
Node's `gzipSync`, not transfer measurements from a production proxy.

| Route | HTML gzip before → after (bytes) | Median before → after (ms) |
|---|---:|---:|
| `/` | 7,324 → 7,541 | 48.25 → 43.38 |
| `/id` | 7,412 → 7,627 | 43.60 → 45.36 |
| `/search?q=warung&island=bali` | 3,949 → 4,115 | 18.65 → 16.73 |
| `/host/bali` | 5,480 → 5,645 | 11.53 → 11.68 |
| `/host/bali/c/travel-experiences` | 4,962 → 4,988 | 56.39 → 24.77 |
| `/host/gianyar.bali/ubud/warung-babi-guling-ibu-oka` | 8,509 → 8,596 | 59.65 → 60.99 |
| `/claim` | 1,292 → 1,293 | 2.55 → 2.45 |

The build emits one global hashed CSS asset: **10,967 → 10,042 bytes raw**,
**2,826 → 2,914 bytes gzip** (+88 compressed bytes). Source global CSS is
11,571 bytes / 3,187 gzip, inside the unchanged 14,000 / 4,000 byte gates;
the built asset stays below 11,000 bytes. Inline component CSS is included
in the HTML measurements, so it is not hidden from the comparison.

No new eager JS, webfonts or decorative images were introduced. These small
loopback samples do not establish a live speed improvement. Cold-cache,
throttled-device LCP/INP/CLS and map-tile transfer were not measured. Existing
lazy raster tiles remain viewport-dependent; a larger map can request more
tiles. Field measurement and a strict image-free vector map remain separate
follow-ups.

## Release

This is a review candidate, not a production deployment. Follow
[release-decision.md](../ops/release-decision.md) and
[vps-deploy.md](../ops/vps-deploy.md): review and CI, authorize the exact SHA,
back up the live Compose data volume, deploy, run status/public checks, and
record the actual release and rollback SHAs. Do not reuse the old release's
authorization or run the demo seed in production.
