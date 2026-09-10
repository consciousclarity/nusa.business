import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, before } from "node:test";
import {
  ADMIN_PROVINCE_COUNT,
  ADMIN_REGENCY_COUNT,
  ADMIN_PROVINCES,
  GEO_REGION_ORDER,
} from "@nusa/db";
import { PROVINCE_HOST_SLUGS } from "../scripts/lib/place-wildcard-islands.mjs";

describe("Indonesia 38 provinces and 514 kabupaten/kota", () => {
  before(() => {
    process.env.NUSA_DATA_DIR = mkdtempSync(join(tmpdir(), "nusa-prov-"));
    process.env.NUSA_ALLOW_DEMO_SEED = "1";
  });

  it("pins the BPS inventory counts", () => {
    assert.equal(ADMIN_PROVINCE_COUNT, 38);
    assert.equal(ADMIN_REGENCY_COUNT, 514);
    assert.equal(ADMIN_PROVINCES.length, 38);
    assert.deepEqual(
      [...PROVINCE_HOST_SLUGS].sort(),
      ADMIN_PROVINCES.map((p) => p.slug).sort(),
    );
  });

  it("seeds 38 active provinces plus region hubs", async () => {
    const { resetSeed, listProvinces, listRegionHubs, listPlaces, getPlace } =
      await import("@nusa/db");
    resetSeed();
    const provinces = listProvinces();
    assert.equal(provinces.length, 38);
    assert.equal(
      provinces.filter((p) => p.status === "active").length,
      38,
    );
    const hubs = listRegionHubs();
    assert.ok(hubs.some((h) => h.slug === "java"));
    assert.ok(!hubs.some((h) => h.slug === "bali"));
    assert.ok(!provinces.some((p) => p.slug === "java"));
    assert.ok(!provinces.some((p) => p.slug === "lombok"));
    assert.ok(GEO_REGION_ORDER.includes("java"));
    const admin = listPlaces("bali").filter(
      (p) => p.type === "kabupaten" || p.type === "kota",
    );
    assert.equal(admin.length, 9);
    assert.ok(getPlace("bali", "jembrana"));
    assert.ok(getPlace("bali", "tabanan"));
    assert.ok(getPlace("nusa-tenggara-barat", "lombok-utara"));
    assert.ok(getPlace("lombok", "lombok-utara"));
    assert.ok(getPlace("java", "yogyakarta"));
    assert.equal(getPlace("java", "yogyakarta")?.islandId, "isl-di-yogyakarta");
    assert.ok(getPlace("jawa-barat", "bandung"));
    assert.ok(getPlace("jawa-barat", "kabupaten-bandung"));
  });

  it("keeps Ibu Oka on gianyar.bali/ubud", async () => {
    const { resetSeed, getBusiness, getPlace } = await import("@nusa/db");
    resetSeed();
    const ubud = getPlace("bali", "ubud");
    const gianyar = getPlace("bali", "gianyar");
    assert.equal(ubud?.parentPlaceId, gianyar?.id);
    assert.ok(getBusiness("bali", "ubud", "warung-babi-guling-ibu-oka"));
  });

  it("counts 514 kabupaten/kota across provinces", async () => {
    const { resetSeed, listProvinces, getStore } = await import("@nusa/db");
    resetSeed();
    const store = getStore();
    const provinceIds = new Set(listProvinces().map((p) => p.id));
    const admin = store.places.filter(
      (p) =>
        provinceIds.has(p.islandId) &&
        (p.type === "kabupaten" || p.type === "kota"),
    );
    assert.equal(admin.length, 514);
    const kota = admin.filter((p) => p.type === "kota").length;
    const kab = admin.filter((p) => p.type === "kabupaten").length;
    assert.equal(kab, 416);
    assert.equal(kota, 98);
  });
});
