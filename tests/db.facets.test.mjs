import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, before } from "node:test";

describe("listing facet filters", () => {
  before(() => {
    process.env.NUSA_DATA_DIR = mkdtempSync(join(tmpdir(), "nusa-facets-"));
    process.env.NUSA_ALLOW_DEMO_SEED = "1";
  });

  it("filters seed listings by cuisine, dietary, and 24-hour availability", async () => {
    const { resetSeed, listBusinesses } = await import("@nusa/db");
    resetSeed();

    const ubudBalinese = listBusinesses({
      islandSlug: "bali",
      placeSlug: "ubud",
      category: "warungs-local-food",
      facets: { cuisine: ["balinese"] },
    });
    assert.ok(ubudBalinese.some((b) => b.slug === "warung-babi-guling-ibu-oka"));

    const denpasarHalal = listBusinesses({
      islandSlug: "bali",
      placeSlug: "denpasar",
      category: "restaurants",
      facets: { dietary: ["halal"] },
    });
    assert.ok(denpasarHalal.some((b) => b.slug === "rumah-makan-halal-denpasar"));

    const nusaDua = listBusinesses({
      islandSlug: "bali",
      placeSlug: "nusa-dua",
      category: "hotels",
      facets: { location_feature: ["beachfront"] },
    });
    assert.ok(nusaDua.some((b) => b.slug === "nusa-dua-beach-hotel"));

    const pharmacies = listBusinesses({
      islandSlug: "bali",
      category: "pharmacies",
      facets: { availability: ["24-hours"] },
    });
    assert.ok(pharmacies.some((b) => b.slug === "klinik-sehat-gianyar"));

    const scooters = listBusinesses({
      islandSlug: "bali",
      placeSlug: "canggu",
      category: "motorcycle-scooter-rentals",
      facets: { rental_type: ["self-drive"] },
    });
    assert.ok(scooters.some((b) => b.slug === "canggu-scooter-rental"));
  });
});
