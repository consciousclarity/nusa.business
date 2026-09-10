# Nation homepage — structure spec

Companion to [teletype.md](teletype.md), which governs the visual language. This
document specifies the **content structure** of the apex homepage only:
`nusa.business`, `HostContext.kind === "nation"`, rendered by
`apps/web/src/pages/index.astro`.

Island, place and listing pages are out of scope.

## Target structure

```
Navigation                          Base.astro — no change
Lede                                no change
Unified search                      no change
Directory map                       no change (added in #56)
Browse by category                  NEW
Island groups                       NEW
Provinces                           existing, stays
Recently added                      NEW, conditional
How Nusa works                      NEW
Add or claim your business          modify
Footer                              Base.astro — no change
```

Navigation, crumbs and footer already live in `apps/web/src/layouts/Base.astro`.
Do not rebuild them here.

## Two decisions that shape everything below

### Text-first. No photographs.

The structure this spec derives from originally called for a destination image
and photo cards. Both are out.

- `docs/ideas/2026-09-07-fast-text-and-contact.md` records the product stance:
  *"the most important aspect is that the platform is fast, no images."*
- `teletype.md` sets the hard rule: **0 images in page chrome.**
- The data does not support it anyway: `Business.gallery` is `[]` for every
  seeded listing, and `PublicBusinessCard` — the shape every list and search
  response returns — omits `gallery` entirely.

Cards are dense text rows in the existing `.index-list` idiom.

The **directory map** added in #56 is the honest occupant of the slot a photo
collage would have taken: it is generated from real coordinates, it says
something true about coverage, and it is self-hosted (`/vendor/leaflet/`) and
lazily initialised. Leave it where it is, directly under the search form.

### "Explore by island" is a second tier, not a replacement

`ADR-007` deliberately moved the nation index *to provinces* — "visitors and
field ops think in provinces, not 'Java as one island with four sample cities'" —
and the 38 province links are the site's main internal crawl paths. An
island-only row would partly revert a just-accepted ADR and drop 33 links.

So the page carries both: a short **island-group row** as a scannable entry
point, and the existing **province lists** underneath, unchanged.

Note the three kinds of entity involved, which are easy to conflate:

| Slug | What it is |
|---|---|
| `bali` | a province (and an island) — `kind: "province"` |
| `java`, `sumatra`, `sulawesi`, `kalimantan` | region hubs — `kind: "region"` |
| `lombok` | an **alias** onto the province `nusa-tenggara-barat` |

Only the first two are real one-label hosts, so only those belong in the row.
`maluku` and `papua` are region *groups* with provinces but **no hub**, so they
appear in the province tier only.

## Constraints

These will fail CI if ignored.

**CSS budget is nearly exhausted.** `tests/web.perf-budget.test.mjs` caps source
`global.css` at 14,000 bytes; it measures **13,702 — 298 bytes spare**. Gzip cap
4,000, measured 3,364 (`zlib.gzipSync`, as the test does — not `gzip -9`). Built
CSS cap 11,000. A scoped `<style>` in an `.astro`
file escapes the source check but still counts toward the built one.

Every section below reuses existing classes. **Target zero new CSS.**

**Production has no businesses.** `packages/db/src/repository.ts` seeds demo data
only outside production; the live store is geography-only (`businesses: []`).
Locally there are 29 demo listings, all `sample: true`, 24 of them in Bali. So
any listing-backed section must render correctly as *empty* — that is the live
case today, not an edge case. Geography, by contrast, is always present.

**`tests/web.visitor-chrome.test.mjs:56-67` reads `index.astro` as source text**
and pins exact strings:

```js
assert.match(home, /name="q"/);
assert.match(home, /name="category"/);
assert.match(home, /action=\{searchAction\}/);
assert.match(home, /categoryLabel\(group.slug, locale\)/);
assert.match(home, /tenantHref\(/);
assert.match(home, /apiTry</);
assert.match(home, /directoryUnavailable/);
assert.match(home, /islandTagline\(locale, island.slug, island.tagline\)/);
assert.match(home, /islandName\(locale, island.slug, island.name\)/);
assert.doesNotMatch(home, /kind=nation/);
assert.doesNotMatch(home, /class="resolver"/);
assert.doesNotMatch(home, /publicUrl\(/);
```

The last two `match`es pin the **map-callback variable name to `island`**.
Renaming it to `province` breaks the suite.

**No hydrated components.** The perf test rejects any `client:*` directive under
`pages/`. All data is fetched server-side.

## Sections

### Lede — no change

`.lede` with `h1` = `t(locale, "nationH1")` and `.prose` = `t(locale, "nationLede")`.
To change the wording to "Find great local businesses across Indonesia", edit the
`nationH1` string in `apps/web/src/i18n/ui.ts` — in **both** the `en` and `id`
blocks — not the markup.

### Unified search — no change

The `.filter-bar` GET form already is the unified component: `q`, `island`,
`category`, submit. The tests pin its markup. Leave it alone.

### Directory map — no change

`<DirectoryMap>` from #56, fed by `nationMarkers`. Stays directly under the
search form.

### Browse by category — NEW

Data: `TAXONOMY` imported from `@nusa/shared`. **No fetch** — it is a
compile-time constant, so this section costs nothing and can never fail.

Two problems worth being explicit about:

**There is no popularity signal.** No listing counts, no click data, no
`popular` field anywhere in `packages/db/src/types.ts`. Ordering 16 groups by an
invented rank would break teletype's rule that *"every rule, label and marker
must encode something true about the content."* So: render **all 16 groups,
unranked**, headed "Browse by category" (new key `browseCategories`), and omit
the `<span class="n">` numbering — numbering here would imply a rank that does
not exist.

**Where a category links.** `/c/{category}` is the indexable category path under
ADR-006, but it exists only **under a tenant host**
(`apps/web/src/pages/host/[label]/c/[...facet].astro`). There is no nation-level
`/c/` route. The only nation-scoped destination is `/search?category={slug}`,
which `robots.txt` disallows. Link there regardless: it is correct for a user,
and with zero listings nation-wide a nation-level `/c/` page would be `noindex`
under ADR-006 rule 2 anyway, so building one now buys nothing. Revisit once real
listings exist.

```astro
<section class="section">
  <h2>{t(locale, "browseCategories")}</h2>
  <ul class="index-list">
    {TAXONOMY.map((group) => (
      <li>
        <div class="index-row">
          <a class="name" href={`${searchAction}?category=${group.slug}`}>
            {categoryLabel(group.slug, locale)}
          </a>
        </div>
      </li>
    ))}
  </ul>
</section>
```

Keep the literal `categoryLabel(group.slug, locale)` — the test pins it.

### Island groups — NEW

The four `kind: "region"` hubs plus Bali, in `GEO_REGION_ORDER` sequence:
**sumatra, java, bali, kalimantan, sulawesi**.

`/v1/islands` already returns `islands` (42 rows, regions included) alongside
`provinces` (38). Today `index.astro` discards the region rows. Derive them:

```ts
const hubs = (data?.islands ?? [])
  .filter((i) => i.status === "active" && (i.kind === "region" || i.slug === "bali"))
  .sort(
    (a, b) =>
      regionOrder.indexOf(a.region ?? a.slug) -
      regionOrder.indexOf(b.region ?? b.slug),
  );
```

Heading uses the **existing** key `regionHubs` ("Island groups" / "Kelompok
pulau"). Render as `.index-list` with `.n`, `.name` and `.index-desc` —
numbering is honest here, it is an index. Link via
`tenantHref(req, { island: island.slug, locale })`.

```astro
<section class="section">
  <h2>{t(locale, "regionHubs")}</h2>
  <ol class="index-list">
    {hubs.map((island, i) => (
      <li>
        <div class="index-row">
          <span class="n">{String(i + 1).padStart(2, "0")}</span>
          <a class="name" href={tenantHref(req, { island: island.slug, locale })}>
            {islandName(locale, island.slug, island.name)}
          </a>
          <span class="rhs"><span>{island.slug}.nusa.business</span></span>
        </div>
        <p class="index-desc">
          {islandTagline(locale, island.slug, island.tagline)}
        </p>
      </li>
    ))}
  </ol>
</section>
```

The callback variable **must** be named `island` — see the pinned assertions.

Clicking Java lands on `java.nusa.business`, which already lists its six child
provinces: `host/[label]/index.astro` branches on `island.kind === "region"` and
renders `childProvinces`. The two-tier path works end to end today.

### Provinces — existing, stays

Unchanged, below the island row, under the existing `provinces` heading with its
per-region `h3` groups. This preserves every crawl path and the ADR-007 stance.

One existing wart worth fixing while here: each region group's numbered list
restarts at `01`, so the page shows eight lists all beginning `01`. Either number
continuously across groups, or drop `.n` from this tier now that the island row
above carries the numbering.

### Recently added — NEW, conditional

There is **no `featured` field** on `Business`, and no ranking logic anywhere —
the island hub's existing "Featured listings" is literally `businesses.slice(0, 9)`
in seed order. Presenting an arbitrary slice as "featured" is the kind of claim
teletype forbids. Head it **"Recently added"** (new key `recentlyAdded`).

The data is **already fetched**: #56 added
`apiTry<{ results: NationHit[] }>("/v1/search")` to the `Promise.all` for map
markers. With no parameters that route returns every non-draft business
nation-wide with geo context. Widen the existing `NationHit` type to carry
`summary`, `categories` and `sample` rather than adding a second request.

Render with the established listing-row pattern — `.index-list` → `.index-row`
with `.n`, `.name` (via `tenantHref` with island + place + area + slug), `.rhs`,
and `.index-desc` for the summary. Show `<span class="stamp">{t(locale, "sampleListing")}</span>`
in `.rhs` when `business.sample`, otherwise the first category label.

**Gate the whole section on a non-empty result:**

```astro
{(search?.results ?? []).length > 0 && (
  <section class="section">
    <h2>{t(locale, "recentlyAdded")}</h2>
    …first 6 rows…
  </section>
)}
```

In production today this renders nothing at all, which is the correct outcome —
better than a heading over a void. Do not add a "no listings yet" placeholder to
the homepage.

Follow-up worth raising with product: a real featured signal could be built from
`verifiedAt` (set when a claim is approved) or from review counts. Both exist in
the data; neither is ranked today.

### How Nusa works — NEW

Static copy, no data, so it behaves identically in production. Three items — a
genuine sequence, so `.index-list` with `.n` numbering is honest here. Every
claim below is true of this codebase today:

1. **Free listings, 0% commission** — a stated non-negotiable in `AGENTS.md`.
2. **Owner-verified claims** — the claim → admin approval flow sets `verifiedAt`;
   listing pages already render `ownerVerified` / `listedUnclaimed`.
3. **Contact the business directly** — listings surface phone and WhatsApp deep
   links via `contactDigits` / `whatsappHref` in `@nusa/shared`. No middleman, no
   booking fee.

New keys: `howItWorks`, plus a title and body for each of the three.

### Add or claim your business — modify

The `.actions` row already exists with `.cta` / `.cta.secondary`; #54 removed the
"Open Bali" CTA, leaving only `addListing`. Give it its own `.section` with a
heading, and restore a second button using the **existing** key `claimListing`
("Claim an existing listing"), linking to `withLocale("/claim", locale)`.

## New i18n keys

Add to **both** the `en` and `id` blocks of `apps/web/src/i18n/ui.ts`:

| Key | en |
|---|---|
| `browseCategories` | Browse by category |
| `recentlyAdded` | Recently added |
| `howItWorks` | How nusa.business works |
| `howFree` / `howFreeBody` | Free listings · no commission at launch |
| `howVerified` / `howVerifiedBody` | Owner-verified · claims reviewed by an operator |
| `howDirect` / `howDirectBody` | Contact direct · phone and WhatsApp, no middleman |

Reused as-is: `regionHubs`, `provinces`, `regenciesCities`, `sampleListing`,
`addListing`, `claimListing`, `directoryUnavailable`.

## CSS budget

Every section reuses existing classes, so the 298-byte headroom should stay
untouched.

If a new rule proves unavoidable, pay for it by deleting the dead `.resolver`
block — verified unused across every page, component and layout since the
C-series removed the debug resolver from public pages. It is `global.css` lines
390–417 (≈470 bytes), plus the `.resolver` selectors in the narrow-viewport block
at lines 725–740 (≈60 bytes, leaving the `.kv` selectors they share). That lifts
headroom to roughly **830 bytes**.

Do **not** delete `.stack` or `.review-note` — each is still used once.

## Out of scope

**Component extraction.** The search form is duplicated between `index.astro` and
`search.astro`, and the index-list pattern appears in five files. Both deserve
extraction, but doing it here would touch `search.astro`, `PlaceDirectory.astro`,
`CategoryBrowse.astro` and both host pages — and could move test-pinned strings
out of `index.astro` and break `web.visitor-chrome`. Separate change.

**A nation-level `/c/{category}` route.** Worth building once listings exist;
pointless while the nation-wide count is zero.

**Photographs.** Not until the product stance in
`docs/ideas/2026-09-07-fast-text-and-contact.md` is revisited and `gallery` is
actually populated.

## Suggested order

1. Island-groups row, provinces block left in place — no new i18n, lowest risk.
2. Browse-by-category block + `browseCategories`.
3. Recently-added block, reusing the existing `/v1/search` result, gated on
   non-empty.
4. How-it-works and the CTA section, with their new keys.
5. Run the gates.

## Verification

```bash
npm run build:packages && npm run build && npm test
```

- `tests/web.visitor-chrome.test.mjs` — the pinned source strings survived,
  especially the `island` callback variable name.
- `tests/web.perf-budget.test.mjs` — source, gzip and built CSS still under cap;
  no `client:*` directive introduced.
- Dev walk-through with `npm run dev:api` + `npm run dev:web`:
  `http://localhost:4321/` (nation), `/id/` (Indonesian labels), `/host/java`
  (region hub lists six provinces), `/host/bali` (province hub), and a category
  link through to `/search?category=food-drink`.
- **The production-shaped case matters most.** Run the API with
  `NUSA_ALLOW_DEMO_SEED` unset so the store is geography-only, and confirm the
  homepage renders lede, search, map, categories, island groups, provinces,
  how-it-works and the CTA — with the recently-added section **absent**, not
  empty.
- Stop the API and reload: the `directoryUnavailable` branch must still render
  the search form and the category block.
