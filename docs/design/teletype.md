# Teletype — visual design specification

The public surface (`apps/web`) is a **tropical modernist editorial**: warm
paper, hairline rules, and machine-set labels, with humanist reading type for
the sentences people actually read. Sophisticated and very fast — not a generic
marketplace skin, and not retro pastiche.

This document is the spec. Implement from it directly — every colour, stack and
rule needed is here.

## The idea in one line

A nested geographic directory printed on pulp, with botanical and terracotta
used the way a magazine uses ink: sparingly, on links, actions, and focus.

Nation → island → place → record is still the shape of the product. The chrome
(path, resolver, stamps, tables) stays typographic and indexed. The prose
(summaries, descriptions, reviews) is set to be read.

## What this is NOT

Read this list before writing any CSS. Getting these wrong produces a parody.

- **Not a terminal.** No phosphor green, no black CRT ground, no scanlines, no
  blinking cursor, no fake command prompt. The ground is paper, not a screen.
- **Not retro kitsch.** No "under construction", no visitor counter, no marquee,
  no beveled buttons, no tiled background, no Comic Sans, no 88×31 badges.
- **Not a generic marketplace.** No pill cards, no drop shadows, no gradient
  hero, no Fraunces-on-cream AI default, no default browser link blue.
- **Not historic-web costume.** `--link` is no longer `#1a29c4`. The 1994 index
  *shape* remains; the link colour does not.
- **No decoration that carries no information.** Every rule, label and marker
  must encode something true about the content.

## Tokens

Define these on `:root` in `apps/web/src/styles/global.css`. Style components
through the tokens only — never hard-code a colour inside a component rule, and
never declare a colour for the first time inside a media query.

Leaflet circle markers cannot read CSS variables; they use the light `--pine`
hex `#1a3d32` so pins stay readable on OSM’s light tiles in both themes.

```css
:root {
  --paper:        #eeece6;  /* warm off-white pulp — keep this ground */
  --paper-2:      #e6e3db;  /* inset blocks */
  --ink:          #1a1c22;  /* carbon */
  --ink-soft:     #45474e;  /* secondary prose, labels, th — AA on paper */
  --ink-faint:    #5c5e66;  /* metadata still secondary, now AA on paper */
  --rule:         #c9c6bc;  /* hairlines */
  --link:         #9a3d18;  /* terracotta — unvisited links */
  --link-visited: #1a3d32;  /* botanical green */
  --pine:         #1a3d32;  /* botanical — CTA, focus, map, active chips */
  --stamp:        #9a3d18;  /* terracotta — status flags */
  --radius:      6px;      /* 4–8px corners; never pills */
}
```

Two accents only: **terracotta** (`--link` / `--stamp`) and **botanical green**
(`--pine` / `--link-visited`). Use them on links, primary CTA, `:focus-visible`,
and map / active chips. Do not tint large surfaces.

`--stamp` remains semantic (`Coming soon`, `Unclaimed`) and shares terracotta
so status does not introduce a third hue.

### Dark mode — carbon copy

The same document inverted through the platen. Three states must be handled:
the bare `:root` above is light; a `prefers-color-scheme` block guarded against
an explicit light choice; and an explicit dark stamp. Redefine **only** tokens
in the latter two.

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* tokens below */ }
}
:root[data-theme="dark"] { /* the same tokens again */ }
```

```
--paper #17181c   --paper-2 #1f2126   --ink #e4e2da
--ink-soft #b4b3ab   --ink-faint #9c9a92   --rule #34363c
--link #e08a62   --link-visited #8fbfa8   --pine #8fbfa8
--stamp #e08a62
```

`body` must set `background: var(--paper)` explicitly.

Light terracotta `#9a3d18` and dark terracotta `#e08a62` both meet WCAG AA
against their `--paper`. Botanical green does too. Do not lighten `--ink-faint`
or `--ink-soft` back to the old `#8a8b91` / `#74736d` pair — those failed AA
at metadata size.

## Type

**Zero webfonts.** No Google Fonts, no `@import`, no new font files. The
performance budget forbids them. Use a high-quality **system stack**.

```css
--sans: ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif;
--mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
        "Liberation Mono", monospace;
--serif: "Iowan Old Style", Palatino, Georgia, ui-serif, serif;
```

| Role | Face | Notes |
|---|---|---|
| Page default (body copy, listing names) | `--sans` | **~17px** (`--step-0`), line-height **1.7** |
| Prose — summaries, descriptions, reviews | `--serif` | same 17px, line-height 1.7, `max-width: 66ch` |
| Labels, navigation, metadata, breadcrumbs, tables, section headings, stamps | `--mono` | uppercase + tracking; `--step--1` |

**Uppercase monospace is reserved for labels, navigation, and metadata** — not
body paragraphs. Body and `.prose` never set `text-transform: uppercase`.

Section headings stay mono uppercase with a hairline rule — index headers, not
a display face. There is no webfont display typeface in this system.

Scale (only these steps):

```
--step--1: 0.81rem     labels, metadata, table text
--step-0:  1.0625rem   body default (~17px)
--step-1:  1.0625rem   prose, h3
--step-2:  1.31rem     wordmark
--step-3:  clamp(1.5rem, 1.1rem + 1.6vw, 2.1rem)   reserved, use sparingly
```

Use `font-variant-numeric: tabular-nums` anywhere digits align — opening hours,
review scores, index numbering.

## Layout

- Single column, `width: var(--page-measure)` where
  `--page-measure: min(78ch, calc(100% - 2 * --page-gutter - safe-area insets))`
  and `--page-gutter: clamp(0.85rem, 3.5vw, 1.25rem)`. `margin-inline: auto`.
- Left-aligned throughout. Nothing is centred.
- Space siblings with flex/grid `gap`, not per-element margins.
- **Hairline rules**, plus **subtle 4–8px radii** on controls, stamps, banners,
  resolver, chips, and map panes (`--radius: 6px`). Not pill cards (`999px`).
  No `box-shadow`. No gradient. No radial washes on `body`.
- Wide content (tables) sits in its own `overflow-x: auto` container. The page
  body never scrolls sideways (`overflow-x: clip` on `body`).
- Information-dense. This is an index, not a landing page — closer spacing than
  a marketing site, but never cramped.

### Narrow viewports (`max-width: 40rem`)

Indonesia is mobile-heavy. Below ~640px:

- Masthead stacks (brand, then nav); still left-aligned.
- Resolver / record `dl` go single-column (label above value).
- Index list drops to two columns; metadata (`.rhs`) wraps under the name.
- Index rows use `display: contents` so the description aligns to the name
  column without fake left padding.
- Primary actions stretch full width; controls get a ~44px min height.
- Form controls use `font-size: 1rem` so iOS does not zoom on focus.

## Components

### Masthead
Wordmark `nusa.business` with `.business` in `--ink-faint`, nav on the right in
uppercase mono at `--step--1`. Single `1px solid var(--ink)` rule beneath.

### Resolver block — the hero
Replaces any conventional hero. An inset `--paper-2` block, `1px solid --rule`,
`--radius` corners, as a definition list showing the parsed host context:

```
QUERY     gianyar.bali.nusa.business
RESOLVED  island=bali · place=gianyar · type=kabupaten
RECORDS   3 published · 0 pending claim
UPDATED   2026-08-08
```

This is `parseHost()` output surfaced as design. It teaches the nested model at
a glance and is the most characteristic thing the product does. Values come from
real data — never fabricate counts.

### Path (breadcrumb)
A literal path string, not chevrons: `nusa.business / bali / gianyar /`. Current
segment in `--ink` bold, ancestors are links. `word-break: break-all` so deep
hosts wrap. Mono throughout.

### Index list
Ordered list, three columns via grid: `2.5ch` zero-padded number, name, right-
aligned metadata. `1px dotted var(--rule)` between rows. Optional description on
a second grid row in serif at `--step-0`. Numbers and `.rhs` stay mono; the
name may inherit the page sans.

The numbering stays: in a directory index, position is real information (it is a
ranked, countable set), and it mirrors how these listings were printed. It is
not ornament.

### Status stamp
`--stamp` text, `1px solid currentColor`, 0.7rem uppercase, tight padding,
`--radius` corners. Used for `Coming soon`, `Unclaimed`, `Pending claim`.

### Record (listing page)
`2px solid var(--ink)` top border, `1px solid var(--rule)` bottom. Name as
heading, serif summary, then a key/value grid (`Category`, `Address`,
`Booking`, `Status`). Opening hours and review scores are **real `<table>`
elements** with a `<caption>` — tabular data belongs in a table, and crawlers
read it.

### Actions
Primary `.cta` and `button` fill `--pine` with `--paper` type; hover shifts to
terracotta (`--link`). Secondary CTA is outlined ink, hover fills `--pine`.
Active map chips (`.chip.is-active`) fill `--pine`.

## Performance budget

Non-negotiable, and the reason the type is system-native rather than a side
effect:

- **0 webfonts**, 0 external stylesheets, 0 external scripts.
- **0 images in page chrome.** Photos appear only in listing galleries, below
  the fold, `loading="lazy"` with explicit `width`/`height`.
- **No framework JavaScript on public pages.** Astro ships none by default — do
  not add a hydrated island to the public surface without an ADR. No JavaScript
  may be required to render or read a page.

  **One exception, which stays:** the small vanilla `<script>` on the record
  page that submits the review and booking forms
  (`apps/web/src/pages/host/[label]/[...path].astro`). It is progressive
  enhancement, not a framework, and removing it would break both forms. Restyle
  the forms freely, but leave the script's behaviour and its `apiBase` wiring
  alone. Any replacement must keep working submission — a native form `POST`
  to an endpoint that redirects back would be an acceptable alternative, but
  that is an API change and out of scope for a design pass.

  This matches `.cursor/rules/nusa-web-astro.mdc`: *"minimize client JS (islands
  only when needed)"* — minimise, not eliminate.
- **CSS budget (C12):** source `global.css` ≤ 14 KB; built hashed CSS ≤ 11 KB;
  gzip of source ≤ 4 KB. Responsive media queries plus the C10/C11 chrome
  pushed past the original ~8 KB aspirational line — gate with
  `tests/web.perf-budget.test.mjs`.
- **Map (listing discovery):** Leaflet is not bundled. It is served from
  `public/vendor/` and fetched only when the nearby panel scrolls into view, so
  a reader who never scrolls there pays nothing for it — see
  [performance.md](../engineering/performance.md#on-demand-vendor-assets).
  The nearby list itself is server-rendered and works without JavaScript.
- HTML responses send `Cache-Control: public, max-age=60, stale-while-revalidate=600`
  (middleware). Edge gzip/brotli remains the reverse proxy’s job.

On a 3G phone in Gianyar the page should load like a text file. For an
SEO-first directory in a mobile-heavy market that is the competitive advantage,
not the compromise.

## Accessibility

- Visible `:focus-visible` — `2px solid var(--pine)`, `outline-offset: 2px`.
  Never remove outlines.
- Skip link (`Skip to content` → `#main-content`) is the first focusable control.
- Body text meets WCAG AA against `--paper` in both themes. `--ink-faint` is for
  metadata only; never body copy or form labels (labels/th use `--ink-soft`).
  Both faint and soft must themselves meet AA at `--step--1` against `--paper`.
- Semantic elements: `<nav aria-label>`, `<table>` with `<caption>` and `<th>`,
  one `<h1>` per page, headings in order. Path crumbs use `aria-current="page"`;
  decorative `/` separators are `aria-hidden`.
- Links are underlined. Colour is never the only signal (form errors also use
  weight + stamp underline + left border).
- Honour `prefers-reduced-motion`. There is almost no motion in this system by
  design.

## Files in scope

| File | Change |
|---|---|
| `apps/web/src/styles/global.css` | Tokens, type split, radii, accents |
| `apps/web/src/layouts/Base.astro` | Only if chrome markup must change |
| Map marker colours in `DirectoryMap.astro` / listing nearby script | `--pine` hex, not link blue |
| This spec | Direction of record |

Sibling layout work (listing identity, sticky bar, search bar, wide grids)
owns HTML structure. Restyle existing classes; do not rewrite those blocks
here.

`apps/portal/src/styles.css` is **out of scope** for now — the portal is an
authenticated tool with different needs. Align it in a later pass.

## Do not change

- `parseHost()` or anything in `packages/shared` — tenancy rules are not a
  styling concern.
- The auth layer (`apps/api/src/auth.ts`) or the `authorization` header wiring
  in `apps/portal/src/api.ts`.
- `packages/db/src/seed-data.ts`.
- The client-side script block in `[...path].astro`. The forms it drives may be
  restyled freely, but the script must not be deleted or rewritten — see the
  exception under **Performance budget**. Deleting it silently breaks review and
  booking submission.

## Acceptance

- [ ] No `@import` of any font, and no request to a third-party origin. First
      render pulls only the document and its own stylesheet — no font, script or
      stylesheet from anywhere else. Same-origin listing photos below the fold
      are expected and do not count against this.
- [ ] `npm run build` exits 0; `npm test` passes (includes perf budget)
- [ ] Light and dark both legible, including with an explicit `data-theme`
      override in either direction
- [ ] No `box-shadow` or `gradient` in `global.css`; radii are `--radius` only
      (4–8px, not pills)
- [ ] Built CSS ≤ 11 KB; source ≤ 14 KB (see Performance budget)
- [ ] Body copy is ~17px sans or serif; uppercase mono is labels/nav/metadata
- [ ] Links are terracotta (visited botanical), AA on `--paper`; no `#1a29c4`
- [ ] `/host/gianyar.bali/babi-guling-pande-egi` shows opening hours as a real
      table with a caption
- [ ] Keyboard tab through a page: every focused element visibly indicated;
      first Tab reveals **Skip to content** and Enter jumps to `#main-content`
- [ ] Page body does not scroll horizontally at 320px width
- [ ] Form labels / table headers remain legible (not `--ink-faint`) in light and dark
- [ ] Metadata (`--ink-faint` / `--ink-soft`) meets WCAG AA against `--paper`
- [ ] HTML responses include short `Cache-Control` (middleware)
