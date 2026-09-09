import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const home = readFileSync(
  new URL("../apps/web/src/pages/index.astro", import.meta.url),
  "utf8",
);
const listing = readFileSync(
  new URL("../apps/web/src/pages/host/[label]/[...path].astro", import.meta.url),
  "utf8",
);
const place = readFileSync(
  new URL("../apps/web/src/components/PlaceDirectory.astro", import.meta.url),
  "utf8",
);
const island = readFileSync(
  new URL("../apps/web/src/pages/host/[label]/index.astro", import.meta.url),
  "utf8",
);
const claim = readFileSync(
  new URL("../apps/web/src/pages/claim.astro", import.meta.url),
  "utf8",
);
const base = readFileSync(
  new URL("../apps/web/src/layouts/Base.astro", import.meta.url),
  "utf8",
);
const search = readFileSync(
  new URL("../apps/web/src/pages/search.astro", import.meta.url),
  "utf8",
);

describe("visitor chrome (no debug resolver)", () => {
  it("homepage is search-first and omits host-resolver jargon", () => {
    assert.match(home, /name="q"/);
    assert.match(home, /action=\{searchAction\}/);
    assert.doesNotMatch(home, /kind=nation/);
    assert.doesNotMatch(home, /class="resolver"/);
  });

  it("listing actions put contact first and claim second", () => {
    assert.match(listing, /t\(locale, "directions"\)/);
    assert.match(listing, /t\(locale, "claimThis"\)/);
    assert.doesNotMatch(listing, /<dt>Host<\/dt>/);
    assert.doesNotMatch(listing, /<dt>Booking<\/dt>/);
    assert.doesNotMatch(listing, /<dt>Status<\/dt>/);
    const claimIdx = listing.indexOf('t(locale, "claimThis")');
    const directionsIdx = listing.indexOf('t(locale, "directions")');
    assert.ok(directionsIdx >= 0 && claimIdx > directionsIdx);
  });

  it("place and island hubs no longer expose resolver panels", () => {
    assert.doesNotMatch(place, /class="resolver"/);
    assert.doesNotMatch(island, /class="resolver"/);
    assert.doesNotMatch(claim, /class="resolver"/);
    assert.doesNotMatch(place, / published/);
  });

  it("footer points at privacy, terms, and support instead of /host paths", () => {
    assert.match(base, /\/privacy/);
    assert.match(base, /\/terms/);
    assert.match(base, /\/support/);
    assert.doesNotMatch(base, /\/host\/gianyar\.bali/);
  });

  it("search results are shareable query URLs and noindex", () => {
    assert.match(search, /name="q"/);
    assert.match(search, /name="island"/);
    assert.match(search, /robots="noindex,follow"/);
  });
});
