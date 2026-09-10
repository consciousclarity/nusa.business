import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const directorySearch = readFileSync(
  new URL("../apps/web/src/components/DirectorySearch.astro", import.meta.url),
  "utf8",
);
const home = readFileSync(
  new URL("../apps/web/src/pages/index.astro", import.meta.url),
  "utf8",
);
const search = readFileSync(
  new URL("../apps/web/src/pages/search.astro", import.meta.url),
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
const browse = readFileSync(
  new URL("../apps/web/src/components/CategoryBrowse.astro", import.meta.url),
  "utf8",
);
const i18n = readFileSync(
  new URL("../apps/web/src/i18n/ui.ts", import.meta.url),
  "utf8",
);

describe("unified directory search bar", () => {
  it("posts q, island, and category to the locale search path", () => {
    assert.match(directorySearch, /role="search"/);
    assert.match(directorySearch, /method="get"/);
    assert.match(directorySearch, /withLocale\("\/search", locale\)/);
    assert.match(directorySearch, /name="q"/);
    assert.match(directorySearch, /name="island"/);
    assert.match(directorySearch, /name="category"/);
    assert.match(directorySearch, /t\(locale, "searchLookingFor"\)/);
    assert.match(directorySearch, /t\(locale, "island"\)/);
    assert.match(directorySearch, /t\(locale, "category"\)/);
    assert.match(directorySearch, /t\(locale, "search"\)/);
    assert.match(directorySearch, /kind !== "region"/);
  });

  it("uses the looking-for copy in English and Indonesian", () => {
    assert.match(i18n, /searchLookingFor: "What are you looking for\?"/);
    assert.match(i18n, /searchLookingFor: "Apa yang Anda cari\?"/);
  });

  it("is the nation and search find bar", () => {
    assert.match(home, /<DirectorySearch locale=\{locale\} provinces=\{provinces\} \/>/);
    assert.match(search, /<DirectorySearch/);
    assert.match(search, /q=\{q\}/);
    assert.match(search, /island=\{island\}/);
    assert.match(search, /category=\{category\}/);
    assert.match(search, /provinces=\{provinces\}/);
  });

  it("locks the province on hubs, places, and listings without replacing facet browse", () => {
    assert.match(island, /<DirectorySearch/);
    assert.match(island, /lockIsland=\{islandData\.island\.kind !== "region"\}/);
    assert.match(place, /<DirectorySearch/);
    assert.match(place, /lockIsland/);
    assert.match(listing, /<DirectorySearch/);
    assert.match(listing, /lockIsland/);
    assert.match(browse, /<DirectorySearch/);
    assert.match(browse, /class="section filter-bar browse-filters"/);
  });
});
