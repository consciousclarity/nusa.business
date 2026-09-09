import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

import {
  EMBEDDED_SEED_COORDS,
  PLACE_CENTROIDS,
  atomicWriteFile,
  backupPathFor,
  backfillStore,
  haversineMeters,
  hasCoords,
  jitterAround,
  lookupSeedCoords,
  parseSeedListingCoords,
  resolveCoords,
  runBackfill,
  utcBackupStamp,
} from "../scripts/backfill-listing-coords.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = join(repoRoot, "packages/db/src/seed-data.ts");
const scriptPath = join(repoRoot, "scripts/backfill-listing-coords.mjs");

function listing(partial) {
  return {
    id: "biz-x",
    placeId: "pl-ubud",
    slug: "x",
    name: "X",
    status: "published",
    categories: ["warungs-local-food"],
    summary: "",
    description: "",
    gallery: [],
    openingHours: [],
    faq: [],
    bookingMode: "none",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

function sampleStore(businesses) {
  return {
    islands: [
      { id: "isl-bali", slug: "bali", name: "Bali", tagline: "", status: "active" },
      { id: "isl-java", slug: "java", name: "Java", tagline: "", status: "active" },
      {
        id: "isl-lombok",
        slug: "lombok",
        name: "Lombok",
        tagline: "",
        status: "active",
      },
      {
        id: "isl-sulawesi",
        slug: "sulawesi",
        name: "Sulawesi",
        tagline: "",
        status: "active",
      },
    ],
    places: [
      { id: "pl-ubud", islandId: "isl-bali", slug: "ubud", name: "Ubud" },
      { id: "pl-gianyar", islandId: "isl-bali", slug: "gianyar", name: "Gianyar" },
      { id: "pl-canggu", islandId: "isl-bali", slug: "canggu", name: "Canggu" },
      { id: "pl-kuta", islandId: "isl-bali", slug: "kuta", name: "Kuta" },
      { id: "pl-kuta-lombok", islandId: "isl-lombok", slug: "kuta", name: "Kuta Lombok" },
      { id: "pl-jimbaran", islandId: "isl-bali", slug: "jimbaran", name: "Jimbaran" },
      {
        id: "pl-yogya",
        islandId: "isl-java",
        slug: "yogyakarta",
        name: "Yogyakarta",
      },
      {
        id: "pl-gili-t",
        islandId: "isl-lombok",
        slug: "gili-trawangan",
        name: "Gili Trawangan",
      },
      {
        id: "pl-makassar",
        islandId: "isl-sulawesi",
        slug: "makassar",
        name: "Makassar",
      },
    ],
    businesses,
    users: [],
    claims: [],
    reviews: [],
    bookings: [],
    vendors: [],
  };
}

describe("backfill listing coords", () => {
  it("parses seed-data.ts and covers every embedded id", () => {
    const parsed = parseSeedListingCoords(readFileSync(seedPath, "utf8"));
    const parsedIds = new Set(parsed.map((r) => r.id));
    for (const row of EMBEDDED_SEED_COORDS) {
      assert.equal(parsedIds.has(row.id), true, `seed-data.ts missing ${row.id}`);
      const hit = parsed.find((r) => r.id === row.id);
      assert.equal(hit.lat, row.lat, row.id);
      assert.equal(hit.lng, row.lng, row.id);
    }
    const ibu = parsed.find((r) => r.slug === "warung-babi-guling-ibu-oka");
    assert.equal(ibu.lat, -8.5069);
    assert.equal(ibu.lng, 115.2625);
  });

  it("fills missing coords from seed id, keeps existing, centroids the rest", () => {
    const preserved = listing({
      id: "biz-pande-egi",
      placeId: "pl-gianyar",
      slug: "babi-guling-pande-egi",
      lat: -8.1111,
      lng: 115.1111,
    });
    const store = sampleStore([
      listing({
        id: "biz-ibu-oka",
        placeId: "pl-ubud",
        slug: "warung-babi-guling-ibu-oka",
      }),
      preserved,
      listing({
        id: "biz-old-mans",
        placeId: "pl-canggu",
        slug: "old-mans-canggu",
      }),
      listing({
        id: "biz-orphan",
        placeId: "pl-canggu",
        slug: "not-in-seed",
      }),
      listing({
        id: "biz-gudeg",
        placeId: "pl-yogya",
        slug: "gudeg-yu-djum",
      }),
    ]);

    const result = backfillStore(store, { now: "2026-09-09T00:00:00.000Z" });
    assert.equal(result.stillMissing, 0);
    assert.equal(result.alreadySet, 1);
    assert.equal(result.filled, 4);

    const ibu = store.businesses.find((b) => b.id === "biz-ibu-oka");
    assert.equal(ibu.lat, -8.5069);
    assert.equal(ibu.lng, 115.2625);
    assert.equal(
      result.changes.find((c) => c.id === "biz-ibu-oka").source,
      "seed-id",
    );

    assert.equal(preserved.lat, -8.1111);
    assert.equal(preserved.lng, 115.1111);

    const canggu = PLACE_CENTROIDS.find((p) => p.id === "pl-canggu");
    const oldMans = store.businesses.find((b) => b.id === "biz-old-mans");
    const orphan = store.businesses.find((b) => b.id === "biz-orphan");
    assert.ok(hasCoords(oldMans));
    assert.ok(hasCoords(orphan));
    const dOld = haversineMeters(canggu.lat, canggu.lng, oldMans.lat, oldMans.lng);
    const dOrphan = haversineMeters(canggu.lat, canggu.lng, orphan.lat, orphan.lng);
    assert.ok(dOld >= 45 && dOld <= 160, `old mans jitter ${dOld}m`);
    assert.ok(dOrphan >= 45 && dOrphan <= 160, `orphan jitter ${dOrphan}m`);
    assert.notEqual(oldMans.lat, orphan.lat);
    assert.ok(dOld < 2000 && dOrphan < 2000);

    const gudeg = store.businesses.find((b) => b.id === "biz-gudeg");
    const yogya = PLACE_CENTROIDS.find((p) => p.id === "pl-yogya");
    assert.ok(
      haversineMeters(yogya.lat, yogya.lng, gudeg.lat, gudeg.lng) < 200,
    );
  });

  it("matches seed coords by slug when the production id drifted", () => {
    const store = sampleStore([
      listing({
        id: "biz-live-ibu-oka",
        placeId: "pl-ubud",
        slug: "warung-babi-guling-ibu-oka",
      }),
    ]);
    backfillStore(store);
    const ibu = store.businesses[0];
    assert.equal(ibu.lat, -8.5069);
    assert.equal(ibu.lng, 115.2625);
  });

  it("overwrites existing coords only with --force", () => {
    const store = sampleStore([
      listing({
        id: "biz-ibu-oka",
        slug: "warung-babi-guling-ibu-oka",
        placeId: "pl-ubud",
        lat: -1,
        lng: 1,
      }),
    ]);
    backfillStore(store);
    assert.equal(store.businesses[0].lat, -1);
    backfillStore(store, { force: true });
    assert.equal(store.businesses[0].lat, -8.5069);
    assert.equal(store.businesses[0].lng, 115.2625);
  });

  it("jitter is deterministic and 50–150 m from the centroid", () => {
    const c = PLACE_CENTROIDS.find((p) => p.slug === "canggu");
    const a = jitterAround("biz-old-mans", c.lat, c.lng);
    const b = jitterAround("biz-old-mans", c.lat, c.lng);
    assert.deepEqual(a, b);
    const d = haversineMeters(c.lat, c.lng, a.lat, a.lng);
    assert.ok(d >= 45 && d <= 160, `jitter ${d}m`);
    assert.ok(a.jitterMeters >= 50 && a.jitterMeters <= 150);
  });

  it("gives every listing coordinates, including unknown places", () => {
    const store = sampleStore([
      listing({ id: "biz-nowhere", placeId: "pl-missing", slug: "ghost" }),
    ]);
    store.places = [];
    const result = backfillStore(store);
    assert.equal(result.stillMissing, 0);
    assert.ok(hasCoords(store.businesses[0]));
    assert.equal(result.changes[0].source, "nation-centroid");
  });

  it("writes a temp store atomically and leaves a .bak", () => {
    const dir = mkdtempSync(join(tmpdir(), "nusa-backfill-"));
    const path = join(dir, "store.json");
    const backupDir = join(dir, "backups");
    const store = sampleStore([
      listing({
        id: "biz-ibu-oka",
        slug: "warung-babi-guling-ibu-oka",
        placeId: "pl-ubud",
      }),
      listing({
        id: "biz-surf-canggu",
        slug: "canggu-surf-school",
        placeId: "pl-canggu",
      }),
    ]);
    writeFileSync(path, JSON.stringify(store));

    const dry = runBackfill({
      store: path,
      backupDir,
      dryRun: true,
      skipBackup: true,
    });
    assert.equal(dry.wrote, false);
    assert.equal(
      JSON.parse(readFileSync(path, "utf8")).businesses[0].lat,
      undefined,
    );

    const result = runBackfill({ store: path, backupDir });
    assert.equal(result.wrote, true);
    assert.ok(result.backup.startsWith(backupDir));
    assert.equal(existsSync(result.backup), true);
    assert.equal(existsSync(backupPathFor(path)), true);

    const written = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(
      written.businesses.find((b) => b.id === "biz-ibu-oka").lat,
      -8.5069,
    );
    assert.ok(hasCoords(written.businesses.find((b) => b.id === "biz-surf-canggu")));
    assert.equal(result.stillMissing, 0);

    const bak = JSON.parse(readFileSync(backupPathFor(path), "utf8"));
    assert.equal(bak.businesses[0].lat, undefined);
  });

  it("atomicWriteFile replaces the target", () => {
    const dir = mkdtempSync(join(tmpdir(), "nusa-atomic-"));
    const path = join(dir, "store.json");
    mkdirSync(dir, { recursive: true });
    atomicWriteFile(path, '{"v":1}');
    atomicWriteFile(path, '{"v":2}');
    assert.equal(readFileSync(path, "utf8"), '{"v":2}');
    assert.equal(readFileSync(backupPathFor(path), "utf8"), '{"v":1}');
  });

  it("utc backup stamp matches ops date -u +%Y%m%dT%H%M%SZ", () => {
    assert.equal(utcBackupStamp(new Date("2026-09-09T05:49:00.123Z")), "20260909T054900Z");
  });

  it("treats 0,0 as missing and fills from seed", () => {
    assert.equal(hasCoords({ lat: 0, lng: 0 }), false);
    const store = sampleStore([
      listing({
        id: "biz-ibu-oka",
        slug: "warung-babi-guling-ibu-oka",
        placeId: "pl-ubud",
        lat: 0,
        lng: 0,
      }),
    ]);
    backfillStore(store);
    assert.equal(store.businesses[0].lat, -8.5069);
    assert.equal(store.businesses[0].lng, 115.2625);
  });

  it("distinguishes Bali Kuta from Lombok Kuta", () => {
    const store = sampleStore([]);
    const bali = resolveCoords({ id: "biz-kuta-bali", placeId: "pl-kuta" }, store);
    const lombok = resolveCoords(
      { id: "biz-kuta-lombok", placeId: "pl-kuta-lombok" },
      store,
    );
    assert.equal(bali.source, "place-centroid");
    assert.equal(lombok.source, "place-centroid");
    assert.ok(Math.abs(bali.lat - lombok.lat) > 0.1);
  });

  it("lookupSeedCoords matches id then slug", () => {
    const byId = lookupSeedCoords({ id: "biz-ibu-oka", slug: "other" });
    assert.equal(byId.lat, -8.5069);
    const bySlug = lookupSeedCoords({
      id: "biz-live-oka",
      slug: "warung-babi-guling-ibu-oka",
    });
    assert.equal(bySlug.lat, -8.5069);
  });

  it("CLI dry-run leaves the store file unchanged and prints JSON", () => {
    const dir = mkdtempSync(join(tmpdir(), "nusa-backfill-cli-"));
    const path = join(dir, "store.json");
    writeFileSync(
      path,
      JSON.stringify(
        sampleStore([
          listing({
            id: "biz-ibu-oka",
            slug: "warung-babi-guling-ibu-oka",
            placeId: "pl-ubud",
          }),
        ]),
      ),
    );
    const result = spawnSync(
      process.execPath,
      [scriptPath, "--store", path, "--dry-run", "--skip-backup"],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout.trim());
    assert.equal(report.dryRun, true);
    assert.equal(report.sources["seed-id"], 1);
    const after = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(after.businesses[0].lat, undefined);
  });

  it("CLI writes coords atomically and rotates .bak", () => {
    const dir = mkdtempSync(join(tmpdir(), "nusa-backfill-cli-w-"));
    const path = join(dir, "store.json");
    const backupDir = join(dir, "backups");
    writeFileSync(
      path,
      JSON.stringify(
        sampleStore([
          listing({
            id: "biz-fish-tours",
            slug: "jimbaran-fish-market-tours",
            placeId: "pl-jimbaran",
          }),
        ]),
      ),
    );
    const result = spawnSync(
      process.execPath,
      [scriptPath, "--store", path, "--backup-dir", backupDir],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout.trim());
    assert.equal(report.stillMissing, 0);
    const after = JSON.parse(readFileSync(path, "utf8"));
    assert.ok(hasCoords(after.businesses[0]));
    assert.ok(existsSync(`${path}.bak`));
    assert.ok(existsSync(report.backup));
  });
});
