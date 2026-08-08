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
    ],
    places: [
      { id: "plc-yogyakarta", islandId: "isl-jawa", slug: "yogyakarta" },
      { id: "plc-bandung", islandId: "isl-jawa", slug: "bandung" },
      { id: "plc-gianyar", islandId: "isl-bali", slug: "gianyar" },
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

    assert.deepEqual(applied, ["2026-08-rename-jawa-to-java"]);
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
    const orphans = store.places.filter((p) => !ids.has(p.islandId));
    assert.deepEqual(orphans, [], "no place may reference a missing island");

    const moved = store.places.filter((p) => p.islandId === "isl-java");
    assert.deepEqual(
      moved.map((p) => p.slug).sort(),
      ["bandung", "yogyakarta"],
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
    for (const p of store.places) {
      if (p.islandId === "isl-jawa") p.islandId = "isl-java";
    }
    assert.deepEqual(migrateStore(store), []);
  });
});
