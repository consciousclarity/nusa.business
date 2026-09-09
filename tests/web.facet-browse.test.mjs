import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const browse = new URL(
  "../apps/web/src/pages/host/[label]/c/[...facet].astro",
  import.meta.url,
);
const base = new URL("../apps/web/src/layouts/Base.astro", import.meta.url);
const sitemap = new URL(
  "../apps/web/src/pages/sitemap.xml.ts",
  import.meta.url,
);

describe("facet browse SEO wiring", () => {
  it("sets robots from the index policy and canonical without extra query", () => {
    const src = readFileSync(browse, "utf8");
    assert.match(src, /robots=\{policy\.index \? "index,follow" : "noindex,follow"\}/);
    assert.match(src, /canonical=\{canonical\}/);
    assert.match(src, /promoteIndexablePath|resolved\.promoted/);
  });

  it("emits a robots meta tag from Base", () => {
    const src = readFileSync(base, "utf8");
    assert.match(src, /<meta name="robots" content=\{robots \|\| "index,follow"\} \/>/);
  });

  it("sitemaps only indexable browse paths", () => {
    const src = readFileSync(sitemap, "utf8");
    assert.match(src, /indexableBrowsePathsForListings/);
    assert.doesNotMatch(src, /searchParams/);
  });
});
