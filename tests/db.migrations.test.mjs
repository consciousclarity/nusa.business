import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { migrateStore } from "@nusa/db";

/**
 * The store is seeded once and then persisted, so a change to seed-data.ts
 * never reaches a store that already exists. Slugs are routing keys — a stale
 * one makes /v1/tls-check reject the host, which stops Caddy issuing a
 * certificate for it. These tests pin the repair path.
 */

/** A store as an already-deployed instance would have it: pre-rename. */
function legacyStore() {
  return {
    islands: [
      { id: "isl-bali", slug: "bali", name: "Bali", tagline: "", status: "active" },
      { id: "isl-jawa", slug: "jawa", name: "Jawa", tagline: "", status: "active" },
      {
        id: "isl-sumatera",
        slug: "sumatera",
        name: "Sumatera",
        tagline: "",
        status: "active",
      },
    ],
    places: [
      { id: "plc-yogyakarta", islandId: "isl-jawa", slug: "yogyakarta" },
      { id: "plc-bandung", islandId: "isl-jawa", slug: "bandung" },
      { id: "plc-gianyar", islandId: "isl-bali", slug: "gianyar" },
      { id: "plc-medan", islandId: "isl-sumatera", slug: "medan" },
    ],
    businesses: [],
    reviews: [],
    claims: [],
    bookings: [],
    vendors: [],
    users: [],
  };
}

describe("store migrations", () => {
  it("renames the island's id, slug and display name", () => {
    const store = legacyStore();
    const applied = migrateStore(store);

    assert.ok(applied.includes("2026-08-rename-jawa-to-java"));
    assert.ok(applied.includes("2026-08-rename-sumatera-to-sumatra"));
    assert.ok(applied.includes("2026-09-indonesia-provinces"));
    assert.deepEqual(store.invites, []);
    assert.deepEqual(store.recoveryTokens, []);
    assert.deepEqual(store.reports, []);
    const island = store.islands.find((i) => i.slug === "java");
    assert.ok(island, "expected an island with slug java");
    assert.equal(island.id, "isl-java");
    assert.equal(island.name, "Java");
    assert.equal(
      store.islands.find((i) => i.slug === "jawa"),
      undefined,
    );
  });

  it("repoints that island's places so none are orphaned", () => {
    const store = legacyStore();
    migrateStore(store);

    const ids = new Set(store.islands.map((i) => i.id));
    const java = store.islands.find((i) => i.slug === "java");
    assert.equal(java.kind, "region");
    const orphans = store.places.filter((p) => !ids.has(p.islandId));
    assert.deepEqual(orphans, [], "no place may reference a missing island");

    assert.equal(
      store.places.find((p) => p.slug === "yogyakarta")?.islandId,
      "isl-di-yogyakarta",
    );
    assert.equal(
      store.places.find((p) => p.slug === "bandung" && p.type !== "kabupaten")
        ?.islandId,
      "isl-jawa-barat",
    );
  });

  it("renames Sumatera to Sumatra and repoints its place", () => {
    const store = legacyStore();
    migrateStore(store);

    const island = store.islands.find((i) => i.slug === "sumatra");
    assert.ok(island, "expected an island with slug sumatra");
    assert.equal(island.id, "isl-sumatra");
    assert.equal(island.kind, "region");
    assert.equal(
      store.places.find((p) => p.slug === "medan").islandId,
      "isl-sumatera-utara",
    );
  });

  it("leaves other islands alone", () => {
    const store = legacyStore();
    migrateStore(store);

    const bali = store.islands.find((i) => i.id === "isl-bali");
    assert.equal(bali.slug, "bali");
    assert.equal(
      store.places.find((p) => p.slug === "gianyar").islandId,
      "isl-bali",
    );
  });

  it("is idempotent — a second run changes nothing", () => {
    const store = legacyStore();
    migrateStore(store);
    const after = JSON.parse(JSON.stringify(store));

    assert.deepEqual(migrateStore(store), [], "second run should apply nothing");
    assert.deepEqual(store, after);
  });

  it("is a no-op on a store already seeded with the new value", () => {
    const store = legacyStore();
    store.islands[1] = {
      id: "isl-java",
      slug: "java",
      name: "Java",
      tagline: "",
      status: "active",
    };
    store.islands[2] = {
      id: "isl-sumatra",
      slug: "sumatra",
      name: "Sumatra",
      tagline: "",
      status: "active",
    };
    for (const p of store.places) {
      if (p.islandId === "isl-jawa") p.islandId = "isl-java";
      if (p.islandId === "isl-sumatera") p.islandId = "isl-sumatra";
    }
    store.invites = [];
    store.recoveryTokens = [];
    store.reports = [];
    const applied = migrateStore(store);
    assert.ok(applied.includes("2026-09-admin-host-parents"));
    assert.ok(applied.includes("2026-09-indonesia-provinces"));
  });

  it("nests Bali tourist areas under kabupaten/kota on an existing store", () => {
    const store = legacyStore();
    store.places = store.places.filter((p) => p.slug !== "gianyar");
    store.places.push(
      {
        id: "pl-gianyar",
        islandId: "isl-bali",
        slug: "gianyar",
        name: "Gianyar",
        type: "kabupaten",
        summary: "Heartland.",
      },
      {
        id: "pl-ubud",
        islandId: "isl-bali",
        slug: "ubud",
        name: "Ubud",
        type: "tourist_area",
        summary: "Arts.",
      },
    );
    migrateStore(store);
    const ubud = store.places.find((p) => p.slug === "ubud");
    const gianyar = store.places.find((p) => p.slug === "gianyar");
    assert.equal(ubud.parentPlaceId, gianyar.id);
    assert.ok(store.places.some((p) => p.slug === "badung"));
  });

  it("rewrites legacy category labels to canonical slugs", () => {
    const store = legacyStore();
    store.businesses = [
      {
        id: "biz-legacy",
        categories: ["Food & Drink", "food-drink", "Professional Services"],
      },
    ];
    const applied = migrateStore(store);
    assert.equal(applied.includes("2026-09-canonicalize-category-slugs"), true);
    assert.deepEqual(store.businesses[0].categories, [
      "food-drink",
      "business-professional-services",
    ]);
    assert.equal(applied.includes("2026-09-listing-facets"), true);
    assert.deepEqual(store.businesses[0].facets, {});
    assert.deepEqual(migrateStore(store), []);
  });

  it("backfills missing listing coordinates from seed so discovery has an origin", () => {
    const store = legacyStore();
    store.places.push({
      id: "pl-ubud",
      islandId: "isl-bali",
      slug: "ubud",
      name: "Ubud",
      type: "tourist_area",
    });
    store.businesses = [
      {
        id: "biz-ibu-oka",
        placeId: "pl-ubud",
        slug: "warung-babi-guling-ibu-oka",
        name: "Warung Babi Guling Ibu Oka",
        status: "published",
        categories: ["warungs-local-food"],
        summary: "Famous Ubud babi guling warung.",
        description: "",
        gallery: [],
        openingHours: [],
        faq: [],
        bookingMode: "none",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "biz-unknown-ubud",
        placeId: "pl-ubud",
        slug: "new-ubud-warung",
        name: "New Ubud Warung",
        status: "published",
        categories: ["warungs-local-food"],
        summary: "Later listing without pins.",
        description: "",
        gallery: [],
        openingHours: [],
        faq: [],
        bookingMode: "none",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    const applied = migrateStore(store);
    assert.equal(applied.includes("2026-09-listing-coords"), true);
    const ibu = store.businesses[0];
    assert.equal(ibu.lat, -8.5069);
    assert.equal(ibu.lng, 115.2625);
    const unknown = store.businesses[1];
    assert.equal(typeof unknown.lat, "number");
    assert.equal(typeof unknown.lng, "number");
    assert.notEqual(unknown.lat, ibu.lat);
    assert.notEqual(unknown.lng, ibu.lng);
    assert.deepEqual(migrateStore(store), [], "coord backfill is idempotent");
  });

  it("fills 38 provinces and 514 kabupaten/kota on an existing store", () => {
    const store = legacyStore();
    const applied = migrateStore(store);
    assert.equal(applied.includes("2026-09-indonesia-provinces"), true);
    const provinces = store.islands.filter((i) => i.kind !== "region");
    assert.equal(provinces.length, 38);
    assert.equal(
      store.places.filter((p) => p.type === "kabupaten" || p.type === "kota")
        .length,
      514,
    );
    const yogya = store.places.find((p) => p.id === "pl-yogya" || p.slug === "yogyakarta");
    assert.ok(yogya);
    assert.equal(yogya.islandId, "isl-di-yogyakarta");
    const java = store.islands.find((i) => i.slug === "java");
    assert.equal(java.kind, "region");
    assert.deepEqual(migrateStore(store), []);
  });
});
