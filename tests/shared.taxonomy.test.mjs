import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CATEGORIES,
  TAXONOMY,
  canonicalizeCategory,
  canonicalizeCategoryList,
  categoryLabel,
  expandCategoryFilter,
  listingMatchesCategory,
  relatedForCategory,
  taxonomyCatalog,
} from "@nusa/shared";

describe("Indonesia category taxonomy", () => {
  it("has 17 groups with unique slugs", () => {
    assert.equal(TAXONOMY.length, 17);
    const slugs = new Set();
    for (const group of TAXONOMY) {
      assert.equal(canonicalizeCategory(group.label), group.slug);
      assert.equal(slugs.has(group.slug), false, `duplicate group ${group.slug}`);
      slugs.add(group.slug);
      for (const child of group.children) {
        assert.equal(canonicalizeCategory(child.label), child.slug);
        assert.equal(slugs.has(child.slug), false, `duplicate leaf ${child.slug}`);
        slugs.add(child.slug);
      }
    }
    assert.equal(slugs.size, 17 + TAXONOMY.reduce((n, g) => n + g.children.length, 0));
  });

  it("keeps Events related services as pointers, not duplicate children", () => {
    const events = TAXONOMY.find((g) => g.slug === "events-weddings");
    assert.ok(events);
    const childSlugs = new Set(events.children.map((c) => c.slug));
    const related = relatedForCategory("events-weddings");
    assert.deepEqual(
      related.map((r) => r.as),
      ["Catering", "Photography", "Makeup", "Florists", "Cakes"],
    );
    for (const rel of related) {
      assert.equal(childSlugs.has(rel.slug), false);
      assert.notEqual(rel.groupSlug, "events-weddings");
    }
    const catalog = taxonomyCatalog().find((g) => g.slug === "events-weddings");
    assert.equal(catalog.related.length, 5);
  });

  it("canonicalizes labels, slugs, and legacy MVP buckets", () => {
    assert.equal(canonicalizeCategory("Food & Drink"), "food-drink");
    assert.equal(canonicalizeCategory("warungs-local-food"), "warungs-local-food");
    assert.equal(canonicalizeCategory("Warungs & Local Food"), "warungs-local-food");
    assert.equal(canonicalizeCategory("Accommodation"), "hotels-accommodation");
    assert.equal(canonicalizeCategory("Professional Services"), "business-professional-services");
    assert.equal(canonicalizeCategory("Maternity & Women's Health"), "maternity-womens-health");
    assert.equal(canonicalizeCategory("Not A Real Category"), undefined);
    assert.equal(categoryLabel("cafes-coffee-shops"), "Cafés & Coffee Shops");
    const list = canonicalizeCategoryList(["Food & Drink", "food-drink", "Restaurants"]);
    assert.equal(list.ok, true);
    assert.deepEqual(list.value, ["food-drink", "restaurants"]);
  });

  it("expands group filters to children and related leaves", () => {
    const food = expandCategoryFilter("Food & Drink");
    assert.equal(food.has("food-drink"), true);
    assert.equal(food.has("warungs-local-food"), true);
    assert.equal(food.has("wedding-planners"), false);

    const events = expandCategoryFilter("events-weddings");
    assert.equal(events.has("wedding-planners"), true);
    assert.equal(events.has("catering-services"), true);
    assert.equal(events.has("photography-studios"), true);
    assert.equal(listingMatchesCategory(["catering-services"], "Events & Weddings"), true);
    assert.equal(listingMatchesCategory(["wedding-planners"], "Catering Services"), false);
  });

  it("exposes every assignable English label on CATEGORIES", () => {
    assert.equal(CATEGORIES.includes("Food & Drink"), true);
    assert.equal(CATEGORIES.includes("Wedding Planners"), true);
    assert.equal(CATEGORIES.includes("Accommodation"), false);
  });
});
