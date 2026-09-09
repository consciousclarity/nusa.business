import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FACET_KEY_LABELS_ID,
  FACET_VALUE_LABELS_ID,
  applyFacetQuery,
  extraQueryFacetCount,
  facetIndexPolicy,
  facetKeyLabel,
  facetValueLabel,
  indexableBrowsePathsForListings,
  isIndexableFacetPath,
  listingMatchesFacets,
  localizeFacetDef,
  parseFacetPath,
  parseFacetQueryParams,
  promoteIndexablePath,
  serializeFacetsCatalog,
} from "@nusa/shared";

describe("directory facet paths", () => {
  it("parses /c/{category} and /c/{category}/{facet}/{value}", () => {
    const cat = parseFacetPath(["warungs-local-food"]);
    assert.equal(cat.ok, true);
    if (cat.ok) {
      assert.equal(cat.browse.category, "warungs-local-food");
      assert.equal(cat.browse.pathFacet, undefined);
    }
    const pair = parseFacetPath(["warungs-local-food", "cuisine", "balinese"]);
    assert.equal(pair.ok, true);
    if (pair.ok) {
      assert.deepEqual(pair.browse.pathFacet, {
        key: "cuisine",
        value: "balinese",
      });
    }
    assert.equal(parseFacetPath(["nope"]).ok, false);
    assert.equal(parseFacetPath(["warungs-local-food", "cuisine"]).ok, false);
  });

  it("allowlists valuable SEO pairs only", () => {
    assert.equal(
      isIndexableFacetPath("warungs-local-food", "cuisine", "balinese"),
      true,
    );
    assert.equal(
      isIndexableFacetPath("restaurants", "dietary", "halal"),
      true,
    );
    assert.equal(
      isIndexableFacetPath("hotels", "location_feature", "beachfront"),
      true,
    );
    assert.equal(
      isIndexableFacetPath("pharmacies", "availability", "24-hours"),
      true,
    );
    assert.equal(
      isIndexableFacetPath("motorcycle-scooter-rentals", "rental_type", "self-drive"),
      true,
    );
    assert.equal(
      isIndexableFacetPath("warungs-local-food", "parking", "valet"),
      false,
    );
  });

  it("indexes category and allowlisted paths; noindexes extra query and empty sets", () => {
    const category = parseFacetPath(["warungs-local-food"]);
    assert.equal(category.ok, true);
    if (!category.ok) return;
    assert.equal(
      facetIndexPolicy(category.browse, { resultCount: 2 }).index,
      true,
    );
    assert.equal(
      facetIndexPolicy(category.browse, { resultCount: 0 }).index,
      false,
    );

    const pair = parseFacetPath(["warungs-local-food", "cuisine", "balinese"]);
    assert.equal(pair.ok, true);
    if (!pair.ok) return;
    assert.equal(facetIndexPolicy(pair.browse, { resultCount: 1 }).index, true);

    const extra = applyFacetQuery(
      pair.browse,
      new URLSearchParams("price_level=budget"),
    );
    assert.equal(extraQueryFacetCount(extra) > 0, true);
    const extraPolicy = facetIndexPolicy(extra, { resultCount: 1 });
    assert.equal(extraPolicy.index, false);
    assert.equal(extraPolicy.canonicalKind, "facet-path");
  });

  it("promotes a single allowlisted query pair onto the path", () => {
    const cat = parseFacetPath(["restaurants"]);
    assert.equal(cat.ok, true);
    if (!cat.ok) return;
    const withQuery = applyFacetQuery(
      cat.browse,
      new URLSearchParams("dietary=halal"),
    );
    const promoted = promoteIndexablePath(withQuery);
    assert.ok(promoted);
    assert.deepEqual(promoted?.pathFacet, { key: "dietary", value: "halal" });
    assert.equal(
      promoteIndexablePath(
        applyFacetQuery(
          cat.browse,
          new URLSearchParams("dietary=halal&price_level=budget"),
        ),
      ),
      null,
    );
  });

  it("matches stored and computed facets on a listing", () => {
    const hours24 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day) => ({ day, open: "00:00", close: "24:00" }),
    );
    assert.equal(
      listingMatchesFacets(
        { facets: { cuisine: ["balinese", "indonesian"] } },
        { cuisine: ["balinese"] },
      ),
      true,
    );
    assert.equal(
      listingMatchesFacets(
        { facets: { cuisine: ["balinese"] } },
        { cuisine: ["javanese"] },
      ),
      false,
    );
    assert.equal(
      listingMatchesFacets(
        { openingHours: hours24, facets: { availability: ["24-hours"] } },
        { availability: ["24-hours"] },
      ),
      true,
    );
    assert.equal(
      listingMatchesFacets({ status: "claimed" }, { verification: ["claimed-listing"] }),
      true,
    );
    assert.equal(
      listingMatchesFacets(
        { ratingAverage: 4.6 },
        { rating: ["4-5-plus"] },
      ),
      true,
    );
  });

  it("parses mixed query keys and emits sitemap rows only for results", () => {
    const selected = parseFacetQueryParams(
      new URLSearchParams("cuisine=balinese&price_level=budget"),
      "warungs-local-food",
    );
    assert.deepEqual(selected.cuisine, ["balinese"]);
    assert.deepEqual(selected.price_level, ["budget"]);

    const paths = indexableBrowsePathsForListings([
      {
        categories: ["warungs-local-food"],
        facets: { cuisine: ["balinese"] },
      },
      {
        categories: ["pharmacies"],
        openingHours: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
          (day) => ({ day, open: "00:00", close: "24:00" }),
        ),
        facets: { availability: ["24-hours"] },
      },
    ]);
    assert.ok(paths.some((p) => p.category === "warungs-local-food" && !p.facet));
    assert.ok(
      paths.some(
        (p) =>
          p.category === "warungs-local-food" &&
          p.facet === "cuisine" &&
          p.facetValue === "balinese",
      ),
    );
    assert.ok(
      paths.some(
        (p) =>
          p.category === "pharmacies" &&
          p.facet === "availability" &&
          p.facetValue === "24-hours",
      ),
    );
    assert.equal(
      paths.some((p) => p.facet === "parking"),
      false,
    );
  });

  it("has Indonesian labels for every facet key and value", () => {
    const catalog = serializeFacetsCatalog();
    const unusedKeys = new Set(Object.keys(FACET_KEY_LABELS_ID));
    const unusedValues = new Set(Object.keys(FACET_VALUE_LABELS_ID));
    function walk(defs) {
      for (const f of defs) {
        unusedKeys.delete(f.key);
        assert.ok(FACET_KEY_LABELS_ID[f.key], `id key missing for ${f.key}`);
        assert.equal(facetKeyLabel(f.key, "id"), FACET_KEY_LABELS_ID[f.key]);
        for (const v of f.values) {
          const ident = `${f.key}::${v.slug}`;
          unusedValues.delete(ident);
          assert.ok(FACET_VALUE_LABELS_ID[ident], `id value missing for ${ident}`);
          assert.equal(
            facetValueLabel(f.key, v.slug, "id"),
            FACET_VALUE_LABELS_ID[ident],
          );
        }
      }
    }
    walk(catalog.global);
    for (const defs of Object.values(catalog.byGroup)) walk(defs);
    assert.deepEqual([...unusedKeys], []);
    assert.deepEqual([...unusedValues], []);
    assert.equal(facetKeyLabel("price_level", "id"), "Tingkat harga");
    assert.equal(facetValueLabel("price_level", "budget", "id"), "Hemat");
    const priced = catalog.global.find((f) => f.key === "price_level");
    assert.ok(priced);
    const localized = localizeFacetDef(priced, "id");
    assert.equal(localized.label, "Tingkat harga");
    assert.equal(
      localized.values.find((v) => v.slug === "budget")?.label,
      "Hemat",
    );
  });
});
