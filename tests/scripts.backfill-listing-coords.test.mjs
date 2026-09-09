import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  applyCoords,
  backfillListingCoords,
  hasCoords,
  jitterAround,
  lookupSeedCoords,
  resolveCoords,
} from "../scripts/backfill-listing-coords.mjs";

const scriptPath = fileURLToPath(
  new URL("../scripts/backfill-listing-coords.mjs", import.meta.url),
);

const geography = {
  islands: [
    { id: "isl-bali", slug: "bali", name: "Bali" },
    { id: "isl-lombok", slug: "lombok", name: "Lombok" },
  ],
  places: [
    { id: "pl-ubud", islandId: "isl-bali", slug: "ubud", name: "Ubud" },
    { id: "pl-gianyar", islandId: "isl-bali", slug: "gianyar", name: "Gianyar" },
    { id: "pl-kuta", islandId: "isl-bali", slug: "kuta", name: "Kuta" },
    { id: "pl-kuta-lombok", islandId: "isl-lombok", slug: "kuta", name: "Kuta Lombok" },
    { id: "pl-unknown-bali", islandId: "isl-bali", slug: "mystery-bay", name: "Mystery Bay" },
  ],
};

function storeWith(businesses) {
  return { ...geography, businesses };
}

describe("backfill listing coords", () => {
  it("matches seed listings by id then slug", () => {
    const byId = lookupSeedCoords({ id: "biz-ibu-oka", slug: "other" });
    assert.deepEqual(byId, { lat: -8.5069, lng: 115.2625 });
    const bySlug = lookupSeedCoords({
      id: "biz-live-oka",
      slug: "warung-babi-guling-ibu-oka",
    });
    assert.deepEqual(bySlug, { lat: -8.5069, lng: 115.2625 });
  });

  it("jitters place centroids deterministically and keeps pins within ~200 m", () => {
    const a = jitterAround(-8.5069, 115.2625, "biz-a");
    const b = jitterAround(-8.5069, 115.2625, "biz-a");
    const c = jitterAround(-8.5069, 115.2625, "biz-b");
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, c);
    const dLatM = Math.abs(a.lat - -8.5069) * 111_320;
    const dLngM = Math.abs(a.lng - 115.2625) * 111_320 * Math.cos((-8.5069 * Math.PI) / 180);
    const meters = Math.hypot(dLatM, dLngM);
    assert.ok(meters >= 40 && meters <= 160, `jitter ${meters}m`);
  });

  it("fills missing coords from seed, place, island, then Indonesia fallback", () => {
    const { store, summary } = backfillListingCoords(
      storeWith([
        { id: "biz-ibu-oka", slug: "warung-babi-guling-ibu-oka", placeId: "pl-ubud" },
        { id: "biz-fish-tours", slug: "jimbaran-fish-market-tours", placeId: "pl-ubud" },
        { id: "biz-mystery", slug: "mystery-bay-warung", placeId: "pl-unknown-bali" },
        { id: "biz-orphan", slug: "no-place", placeId: "pl-missing" },
        {
          id: "biz-keep",
          slug: "already-pinned",
          placeId: "pl-ubud",
          lat: -8.51,
          lng: 115.26,
        },
      ]),
    );
    assert.equal(summary.total, 5);
    assert.equal(summary.alreadyHad, 1);
    assert.equal(summary.filledFromSeed, 1);
    assert.equal(summary.filledFromPlace, 1);
    assert.equal(summary.filledFromIsland, 1);
    assert.equal(summary.filledFromFallback, 1);
    assert.equal(summary.remaining, 0);
    assert.equal(store.businesses[0].lat, -8.5069);
    assert.equal(store.businesses[0].lng, 115.2625);
    assert.equal(store.businesses[4].lat, -8.51);
    assert.ok(hasCoords(store.businesses[1]));
    assert.ok(hasCoords(store.businesses[2]));
    assert.ok(hasCoords(store.businesses[3]));
    const placeResolved = resolveCoords(store.businesses[1], store);
    assert.equal(placeResolved.source, "place");
  });

  it("does not stack two place-centroid listings on the same pin", () => {
    const { store } = backfillListingCoords(
      storeWith([
        { id: "biz-one", slug: "one", placeId: "pl-ubud" },
        { id: "biz-two", slug: "two", placeId: "pl-ubud" },
      ]),
    );
    assert.notEqual(
      `${store.businesses[0].lat},${store.businesses[0].lng}`,
      `${store.businesses[1].lat},${store.businesses[1].lng}`,
    );
  });

  it("distinguishes Bali Kuta from Lombok Kuta", () => {
    const bali = resolveCoords({ id: "biz-kuta-bali", placeId: "pl-kuta" }, geography);
    const lombok = resolveCoords(
      { id: "biz-kuta-lombok", placeId: "pl-kuta-lombok" },
      geography,
    );
    assert.equal(bali.source, "place");
    assert.equal(lombok.source, "place");
    assert.ok(Math.abs(bali.lat - lombok.lat) > 0.1);
  });

  it("--force overwrites existing coords from seed", () => {
    const { store, summary } = backfillListingCoords(
      storeWith([
        {
          id: "biz-ibu-oka",
          slug: "warung-babi-guling-ibu-oka",
          placeId: "pl-ubud",
          lat: 1,
          lng: 1,
        },
      ]),
      { force: true },
    );
    assert.equal(summary.overwritten, 1);
    assert.equal(store.businesses[0].lat, -8.5069);
  });

  it("treats 0,0 as missing", () => {
    assert.equal(hasCoords({ lat: 0, lng: 0 }), false);
    const next = applyCoords(
      { id: "biz-ibu-oka", slug: "warung-babi-guling-ibu-oka" },
      resolveCoords({ id: "biz-ibu-oka", slug: "warung-babi-guling-ibu-oka" }, geography),
    );
    assert.equal(next.lat, -8.5069);
  });

  it("CLI dry-run leaves the store file unchanged", () => {
    const dir = mkdtempSync(join(tmpdir(), "nusa-backfill-"));
    const path = join(dir, "store.json");
    const fixture = storeWith([
      { id: "biz-ibu-oka", slug: "warung-babi-guling-ibu-oka", placeId: "pl-ubud" },
    ]);
    writeFileSync(path, JSON.stringify(fixture));
    const result = spawnSync(process.execPath, [scriptPath, "--store", path, "--dry-run"], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout.trim());
    assert.equal(report.dryRun, true);
    assert.equal(report.filledFromSeed, 1);
    const after = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(after.businesses[0].lat, undefined);
  });

  it("CLI writes coords atomically and rotates .bak", () => {
    const dir = mkdtempSync(join(tmpdir(), "nusa-backfill-w-"));
    mkdirSync(dir, { recursive: true });
    const path = join(dir, "store.json");
    const fixture = storeWith([
      { id: "biz-fish-tours", slug: "jimbaran-fish-market-tours", placeId: "pl-ubud" },
    ]);
    writeFileSync(path, JSON.stringify(fixture));
    const result = spawnSync(process.execPath, [scriptPath, "--store", path], {
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    const after = JSON.parse(readFileSync(path, "utf8"));
    assert.ok(hasCoords(after.businesses[0]));
    assert.ok(existsSync(`${path}.bak`));
    const bak = JSON.parse(readFileSync(`${path}.bak`, "utf8"));
    assert.equal(bak.businesses[0].lat, undefined);
  });
});
