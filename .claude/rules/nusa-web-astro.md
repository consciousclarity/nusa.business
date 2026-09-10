---
paths:
  - "apps/web/**"
---

# apps/web (Astro)

- Server-rendered public pages. **No framework JS on public pages** —
  `tests/web.perf-budget.test.mjs` rejects any `client:*` directive under
  `src/pages/`. Adding a hydrated island needs an ADR.
- Fetch data server-side via `src/lib/api.ts`. Three helpers with different
  failure semantics: `api()` throws, `apiOrNull()` returns null on 404,
  `apiTry()` returns null on any failure — homepage and search use `apiTry` and
  must render a `directoryUnavailable` fallback.
- Tenant pages live under `src/pages/host/[label]/`.
- Build geo links with `tenantHref()` / `geoHref()` in `src/lib/links.ts`. Never
  hand-build hrefs, and do not call `publicUrl()` from a page.
- Layout/branding: `src/layouts/Base.astro` + `src/styles/global.css`. The
  stylesheet is capped at 14,000 bytes source / 4,000 gzipped; reuse existing
  classes rather than adding rules.
- Visual language is `docs/design/teletype.md`: system fonts only, zero
  webfonts, no `border-radius`, no `box-shadow`, no gradients, 0 images in page
  chrome.
- Do not put claim/admin mutations here — link to the portal instead.
