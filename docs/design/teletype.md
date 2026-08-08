# Teletype — visual design specification

The public surface (`apps/web`) is styled as an **early-network document**: the
web as it looked when the internet was starting, executed with modern precision.
Sophisticated and very fast, not retro pastiche.

This document is the spec. Implement from it directly — every colour, stack and
rule needed is here.

## The idea in one line

A nested geographic directory **is** an early-web index. Nation → island → place
→ record was the shape of the 1994 web because it was the shape of the data.
Here it still is, so the aesthetic is honest rather than costume.

## What this is NOT

Read this list before writing any CSS. Getting these wrong produces a parody.

- **Not a terminal.** No phosphor green, no black CRT ground, no scanlines, no
  blinking cursor, no fake command prompt. ARPANET-era output arrived on *paper*
  from a teleprinter. The reference is an archive, not a screen.
- **Not retro kitsch.** No "under construction", no visitor counter, no marquee,
  no beveled buttons, no tiled background, no Comic Sans, no 88×31 badges.
- **Not the current look.** The existing cream `#f3efe6` + Fraunces + terracotta
  `#c45c26` treatment is replaced entirely. It is also close to a generic
  AI-generated aesthetic, which is a second reason to move off it.
- **No decoration that carries no information.** Every rule, label and marker
  must encode something true about the content.

## Tokens

Define these on `:root` in `apps/web/src/styles/global.css`. Style components
through the tokens only — never hard-code a colour inside a component rule, and
never declare a colour for the first time inside a media query.

```css
:root {
  --paper:       #eeece6;  /* pulp, warm grey — deliberately not cream */
  --paper-2:     #e6e3db;  /* inset blocks */
  --ink:         #1a1c22;  /* carbon, slight blue bias */
  --ink-soft:    #55575f;  /* secondary prose */
  --ink-faint:   #8a8b91;  /* labels, metadata */
  --rule:        #c9c6bc;  /* hairlines */
  --link:        #1a29c4;  /* the web's original link blue, tempered */
  --link-visited:#5b2382;  /* the historic visited purple */
  --stamp:       #9e2b1f;  /* registry red — status flags ONLY */
}
```

`--link` is the **only** accent. Links are the only blue thing on the page.
`--stamp` is semantic, used for status (`Coming soon`, `Unclaimed`) and nothing
else — it is not a second accent.

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
--paper #17181c   --paper-2 #1f2126   --ink #e4e2da   --ink-soft #a3a29b
--ink-faint #74736d   --rule #34363c   --link #8fa4ff
--link-visited #c0a0e0   --stamp #e0705f
```

`body` must set `background: var(--paper)` explicitly.

## Type

**Zero webfonts.** Delete the Google Fonts `@import` at the top of
`global.css` — it is a render-blocking external request before any text paints.
Nothing may be downloaded to render a page.

```css
--mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
        "Liberation Mono", monospace;
--serif: ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif;
```

| Role | Face | Notes |
|---|---|---|
| Page default, structure, nav, labels, metadata, breadcrumbs, tables, headings | `--mono` | 0.875rem base, line-height 1.55 |
| Prose — summaries, descriptions, reviews, body copy | `--serif` | 1rem, line-height 1.65, `max-width: 66ch` |

Decision on an open question: **prose is serif, not mono.** Mono throughout is
more austere but hurts readability at length, and listing descriptions are the
one place users actually read sentences. The split — machine chrome, human prose
— is also what makes it read as sophisticated rather than as a gimmick.

Headings are set in mono, uppercase, `letter-spacing: 0.12em`, with a hairline
rule beneath — an RFC section header, not a display face. There is no display
typeface in this system; that absence is the point.

Scale (only these steps):

```
--step--1: 0.78rem    labels, metadata, table text
--step-0:  0.875rem   body default (mono)
--step-1:  1rem       prose, h3
--step-2:  1.25rem    wordmark
--step-3:  clamp(1.5rem, 1.1rem + 1.6vw, 2.1rem)   reserved, use sparingly
```

Use `font-variant-numeric: tabular-nums` anywhere digits align — opening hours,
review scores, index numbering.

## Layout

- Single column, `width: min(78ch, calc(100% - 2.5rem))`, `margin-inline: auto`.
- Left-aligned throughout. Nothing is centred.
- Space siblings with flex/grid `gap`, not per-element margins.
- **Hairline rules instead of cards.** No `border-radius`, no `box-shadow`, no
  gradient, anywhere. Remove the two radial gradients currently on `body`.
- Wide content (tables) sits in its own `overflow-x: auto` container. The page
  body never scrolls sideways.
- Information-dense. This is an index, not a landing page — closer spacing than
  a marketing site, but never cramped.

## Components

### Masthead
Wordmark `nusa.business` with `.business` in `--ink-faint`, nav on the right in
uppercase mono at `--step--1`. Single `1px solid var(--ink)` rule beneath.

### Resolver block — the hero
Replaces any conventional hero. An inset `--paper-2` block, `1px solid --rule`,
as a definition list showing the parsed host context:

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
hosts wrap.

### Index list
Ordered list, three columns via grid: `2.5ch` zero-padded number, name, right-
aligned metadata. `1px dotted var(--rule)` between rows. Optional description on
a second grid row in serif at 0.95rem.

The numbering stays: in a directory index, position is real information (it is a
ranked, countable set), and it mirrors how these listings were printed. It is
not ornament.

### Status stamp
`--stamp` text, `1px solid currentColor`, 0.7rem uppercase, tight padding. Used
for `Coming soon`, `Unclaimed`, `Pending claim`.

### Record (listing page)
`2px solid var(--ink)` top border, `1px solid var(--rule)` bottom. Name as `h3`,
serif summary, then a key/value grid (`Category`, `Address`, `Booking`,
`Status`). Opening hours and review scores are **real `<table>` elements** with
a `<caption>` — tabular data belongs in a table, and crawlers read it.

## Performance budget

Non-negotiable, and the reason for the aesthetic rather than a side effect:

- **0 webfonts**, 0 external stylesheets, 0 external scripts.
- **0 images in page chrome.** Photos appear only in listing galleries, below
  the fold, `loading="lazy"` with explicit `width`/`height`.
- **0 client-side JavaScript on public pages.** Astro ships none by default —
  do not add a framework island to the public surface without an ADR.
- Total CSS under ~8 KB uncompressed. The current file is 136 lines; this should
  land in the same order of magnitude.

On a 3G phone in Gianyar the page should load like a text file. For an
SEO-first directory in a mobile-heavy market that is the competitive advantage,
not the compromise.

## Accessibility

- Visible `:focus-visible` — `2px solid var(--link)`, `outline-offset: 2px`.
  Never remove outlines.
- Body text meets WCAG AA against `--paper` in both themes. `--ink-faint` is for
  non-essential metadata only; never body copy.
- Semantic elements: `<nav aria-label>`, `<table>` with `<caption>` and `<th>`,
  one `<h1>` per page, headings in order.
- Links are underlined. Colour is never the only signal.
- Honour `prefers-reduced-motion`. There is almost no motion in this system by
  design.

## Files in scope

| File | Change |
|---|---|
| `apps/web/src/styles/global.css` | Replace. Drop the font `@import` and both gradients. |
| `apps/web/src/layouts/Base.astro` | Masthead, path, footer markup |
| `apps/web/src/pages/index.astro` | Nation index + resolver block |
| `apps/web/src/pages/host/[label]/index.astro` | Island / place index |
| `apps/web/src/pages/host/[label]/[slug].astro` | Record view |
| `apps/web/src/pages/claim.astro` | Form styling to match |

`apps/portal/src/styles.css` is **out of scope** for now — the portal is an
authenticated tool with different needs. Align it in a later pass.

## Do not change

- `parseHost()` or anything in `packages/shared` — tenancy rules are not a
  styling concern.
- The auth layer (`apps/api/src/auth.ts`) or the `authorization` header wiring
  in `apps/portal/src/api.ts`.
- `packages/db/src/seed-data.ts`.
- The client-side script block in `[slug].astro` may be restyled but its
  `apiBase` behaviour must not change.

## Acceptance

- [ ] No `@import` of any font, and no external request in the network panel
      beyond the document itself
- [ ] `npm run build` exits 0; `npm test` passes
- [ ] Light and dark both legible, including with an explicit `data-theme`
      override in either direction
- [ ] No `border-radius`, `box-shadow` or `gradient` in `global.css`
- [ ] `/host/gianyar.bali/babi-guling-pande-egi` shows opening hours as a real
      table with a caption
- [ ] Keyboard tab through a page: every focused element visibly indicated
- [ ] Page body does not scroll horizontally at 320px width
