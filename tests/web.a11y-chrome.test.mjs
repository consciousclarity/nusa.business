import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const base = readFileSync(
  new URL("../apps/web/src/layouts/Base.astro", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../apps/web/src/styles/global.css", import.meta.url),
  "utf8",
);
const listing = readFileSync(
  new URL("../apps/web/src/pages/host/[label]/[...path].astro", import.meta.url),
  "utf8",
);

describe("public a11y chrome (C10)", () => {
  it("exposes a skip link to main content", () => {
    assert.match(base, /class="skip-link"/);
    assert.match(base, /href="#main-content"/);
    assert.match(base, /id="main-content"/);
    assert.match(base, /tabindex="-1"/);
  });

  it("marks path crumbs and decorative separators for assistive tech", () => {
    assert.match(base, /aria-current="page"/);
    assert.match(base, /class="sep" aria-hidden="true"/);
  });

  it("keeps visible focus styles and honour reduced motion", () => {
    assert.match(css, /a:focus-visible/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(css, /\.skip-link/);
  });

  it("uses AA-friendly label colour (ink-soft, not ink-faint)", () => {
    const labelBlock = css.match(/label\s*\{[^}]+\}/)?.[0] ?? "";
    assert.match(labelBlock, /color:\s*var\(--ink-soft\)/);
    assert.doesNotMatch(labelBlock, /--ink-faint/);
  });

  it("groups review scores in a fieldset and wires booking status", () => {
    assert.match(listing, /<fieldset class="scores">/);
    assert.match(listing, /<legend>\{t\(locale, "reviewScoresLegend"\)\}<\/legend>/);
    assert.match(listing, /aria-describedby="booking-notice"/);
    assert.match(listing, /aria-labelledby="hours-caption"/);
    assert.match(listing, /setAttribute\("aria-invalid"/);
  });
});
