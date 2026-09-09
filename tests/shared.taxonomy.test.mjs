import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CATEGORIES,
  CATEGORY_LABELS_ID,
  RELATED_AS_ID,
  TAXONOMY,
  canonicalizeCategory,
  canonicalizeCategoryList,
  categoryLabel,
  expandCategoryFilter,
  listingMatchesCategory,
  relatedAsLabel,
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
    assert.equal(categoryLabel("cafes-coffee-shops", "id"), "Kafe & kedai kopi");
    assert.equal(categoryLabel("banks-atms", "id"), "Bank & ATM");
    assert.equal(categoryLabel("food-drink", "id"), "Makanan & minuman");
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

  it("has an Indonesian label for every taxonomy slug", () => {
    const unused = new Set(Object.keys(CATEGORY_LABELS_ID));
    for (const group of TAXONOMY) {
      assert.ok(CATEGORY_LABELS_ID[group.slug], `id label missing for ${group.slug}`);
      assert.equal(categoryLabel(group.slug, "id"), CATEGORY_LABELS_ID[group.slug]);
      unused.delete(group.slug);
      for (const child of group.children) {
        assert.ok(CATEGORY_LABELS_ID[child.slug], `id label missing for ${child.slug}`);
        assert.equal(categoryLabel(child.slug, "id"), CATEGORY_LABELS_ID[child.slug]);
        unused.delete(child.slug);
      }
    }
    assert.deepEqual([...unused], [], "CATEGORY_LABELS_ID has unused slugs");
    for (const group of TAXONOMY) {
      for (const rel of group.related ?? []) {
        assert.ok(RELATED_AS_ID[rel.as], `id related-as missing for ${rel.as}`);
      }
    }
    assert.notEqual(categoryLabel("banks-atms", "id"), categoryLabel("banks-atms"));
    assert.notEqual(
      categoryLabel("warungs-local-food", "id"),
      categoryLabel("warungs-local-food"),
    );
    assert.equal(relatedAsLabel("Catering", "id"), "Katering");
    assert.equal(relatedAsLabel("Catering", "en"), "Catering");
  });
});
