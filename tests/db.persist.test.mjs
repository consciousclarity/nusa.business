import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const dataDir = mkdtempSync(join(tmpdir(), "nusa-c07-"));
process.env.NUSA_DATA_DIR = dataDir;
process.env.NODE_ENV = "test";

const { atomicWriteFile, backupPathFor } = await import(
  "../packages/db/dist/persist.js"
);
const db = await import("../packages/db/dist/repository.js");

describe("atomicWriteFile", () => {
  it("replaces the target and keeps a .bak of the previous bytes", () => {
    const path = join(dataDir, "sample.json");
    atomicWriteFile(path, '{"v":1}');
    assert.equal(readFileSync(path, "utf8"), '{"v":1}');
    assert.equal(existsSync(backupPathFor(path)), false);

    atomicWriteFile(path, '{"v":2}');
    assert.equal(readFileSync(path, "utf8"), '{"v":2}');
    assert.equal(readFileSync(backupPathFor(path), "utf8"), '{"v":1}');
    assert.equal(existsSync(`${path}.tmp`), false);
  });
});

describe("store durability", () => {
  it("recovers from a truncated store.json using store.json.bak", () => {
    mkdirSync(dataDir, { recursive: true });
    const seed = db.resetSeed();
    assert.ok(seed.businesses.length > 0);

    const path = join(dataDir, "store.json");
    const bak = backupPathFor(path);
    const first = db.getBusinessById(seed.businesses[0].id);
    const priorSummary = first.summary;

    db.upsertBusiness({
      ...first,
      summary: "durability-check",
      updatedAt: new Date().toISOString(),
    });
    assert.equal(existsSync(bak), true);
    assert.equal(
      JSON.parse(readFileSync(bak, "utf8")).businesses.find(
        (b) => b.id === first.id,
      ).summary,
      priorSummary,
    );

    writeFileSync(path, '{"businesses":[', "utf8");
    assert.throws(() => JSON.parse(readFileSync(path, "utf8")));

    const recovered = db.getStore();
    assert.ok(recovered.businesses.length > 0);
    // Backup held the pre-mutation snapshot.
    assert.equal(
      recovered.businesses.find((b) => b.id === first.id)?.summary,
      priorSummary,
    );
    assert.ok(JSON.parse(readFileSync(path, "utf8")).businesses.length > 0);
    // Good backup retained (not overwritten by corrupt primary).
    assert.equal(
      JSON.parse(readFileSync(bak, "utf8")).businesses.find(
        (b) => b.id === first.id,
      ).summary,
      priorSummary,
    );
  });

  it("refuses to invent a demo store when both primary and backup are garbage", () => {
    const isolated = mkdtempSync(join(tmpdir(), "nusa-c07-dead-"));
    const prev = process.env.NUSA_DATA_DIR;
    process.env.NUSA_DATA_DIR = isolated;
    mkdirSync(isolated, { recursive: true });
    writeFileSync(join(isolated, "store.json"), "{not-json", "utf8");
    writeFileSync(join(isolated, "store.json.bak"), "{also-bad", "utf8");
    assert.throws(() => db.getStore(), /unreadable/);
    process.env.NUSA_DATA_DIR = prev;
  });
});
