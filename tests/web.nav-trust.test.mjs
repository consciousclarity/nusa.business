import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const home = readFileSync(
  new URL("../apps/web/src/pages/index.astro", import.meta.url),
  "utf8",
);
const island = readFileSync(
  new URL("../apps/web/src/pages/host/[label]/index.astro", import.meta.url),
  "utf8",
);
const place = readFileSync(
  new URL("../apps/web/src/components/PlaceDirectory.astro", import.meta.url),
  "utf8",
);
const listing = readFileSync(
  new URL("../apps/web/src/pages/host/[label]/[...path].astro", import.meta.url),
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
const browse = readFileSync(
  new URL("../apps/web/src/components/CategoryBrowse.astro", import.meta.url),
  "utf8",
);
const notice = readFileSync(
  new URL("../apps/web/src/components/DirectoryNotice.astro", import.meta.url),
  "utf8",
);
const shortcuts = readFileSync(
  new URL("../apps/web/src/components/CategoryShortcuts.astro", import.meta.url),
  "utf8",
);
const hero = readFileSync(
  new URL("../apps/web/src/lib/hero-categories.ts", import.meta.url),
  "utf8",
);
const i18n = readFileSync(
  new URL("../apps/web/src/i18n/ui.ts", import.meta.url),
  "utf8",
);
const claim = readFileSync(
  new URL("../apps/web/src/pages/claim.astro", import.meta.url),
  "utf8",
);

describe("nav, trust, category shortcuts, coming soon", () => {
  it("uses Bahasa Indonesia (not cryptic ID) for the language control", () => {
    const header = base.slice(base.indexOf("<header"), base.indexOf("</header>"));
    assert.match(header, /t\(locale, "langSwitch"\)/);
    assert.doesNotMatch(header, /langSwitchShort/);
    assert.match(i18n, /langSwitch: "Bahasa Indonesia"/);
  });

  it("makes Search and Add a business the primary header actions", () => {
    const header = base.slice(base.indexOf("<header"), base.indexOf("</header>"));
    const searchIdx = header.indexOf('withLocale("/search"');
    const addIdx = header.indexOf('t(locale, "navAdd")');
    const claimIdx = header.indexOf('t(locale, "navClaim")');
    const langIdx = header.indexOf('t(locale, "langSwitch")');
    assert.ok(searchIdx >= 0 && addIdx > searchIdx);
    assert.ok(claimIdx > addIdx && langIdx > claimIdx);
    assert.match(header, /class="nav-search"/);
    assert.match(i18n, /navAdd: "Add a business"/);
    assert.match(i18n, /navClaim: "Claim your business"/);
  });

  it("renames Claim to Claim your business on homepage, nav, and unclaimed stamps", () => {
    assert.match(home, /t\(locale, "navClaim"\)/);
    assert.match(claim, /id="claim"/);
    assert.match(claim, /id="add"/);
    assert.match(i18n, /Unclaimed — claim your business/);
    assert.match(i18n, /Belum diklaim — klaim bisnis Anda/);
    assert.match(listing, /listedUnclaimed/);
    assert.match(listing, /claimThis/);
  });

  it("maps hero shortcuts onto existing taxonomy group slugs", () => {
    assert.match(hero, /slug: "food-drink"/);
    assert.match(hero, /slug: "hotels-accommodation"/);
    assert.match(hero, /slug: "travel-experiences"/);
    assert.match(hero, /slug: "transport-automotive"/);
    assert.match(hero, /slug: "health-medical"/);
    assert.match(shortcuts, /heroCategoryHref/);
    assert.match(home, /CategoryShortcuts locale=\{locale\}/);
    assert.match(island, /CategoryShortcuts locale=\{locale\} island=/);
    assert.match(place, /CategoryShortcuts/);
  });

  it("shows trust signals from real listing counts and dates", () => {
    assert.match(home, /listingCount/);
    assert.match(home, /verifiedCount/);
    assert.match(home, /catalogUpdatedDay/);
    assert.match(home, /trustHow/);
    assert.match(i18n, /Field agents register/);
    assert.match(i18n, /not a government certification/);
    assert.match(listing, /lastUpdated/);
    assert.match(listing, /updatedAt/);
    assert.match(island, /trustHeading/);
  });

  it("replaces Browse Bali funnels with coming-soon plus email updates", () => {
    for (const src of [home, island, search, browse, notice, i18n, place]) {
      assert.doesNotMatch(src, /browseBali/);
      assert.doesNotMatch(src, /Browse Bali/);
      assert.doesNotMatch(src, /Buka Bali/);
      assert.doesNotMatch(src, /island: "bali"/);
    }
    assert.match(notice, /mailto:updates@nusa.business/);
    assert.match(notice, /comingSoonUpdate/);
    assert.match(island, /islandComingSoon/);
    assert.match(place, /businesses.length === 0/);
    assert.match(home, /comingSoon/);
  });
});
