import assert from "node:assert/strict";
import fs, {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { mkdtempSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
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

const realWriteSync = fs.writeSync;

function mockWriteSync(t, implementation) {
  const write = t.mock.method(fs, "writeSync", implementation);
  syncBuiltinESMExports();
  t.after(() => {
    write.mock.restore();
    syncBuiltinESMExports();
  });
}

// Exercise a real partial filesystem write with either writeSync overload.
function writeOneByte(fd, data, offset, length, position) {
  if (typeof data === "string") {
    return realWriteSync(fd, Buffer.from(data, length), 0, 1, offset);
  }
  return realWriteSync(fd, data, offset, Math.min(1, length), position);
}

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

  it("completes short writes without splitting UTF-8 characters", (t) => {
    const dir = mkdtempSync(join(dataDir, "short-write-"));
    const path = join(dir, "store.json");
    const initial = JSON.stringify({ name: "Café 🌴 東京" });
    const updated = JSON.stringify({ name: "Warung é 🍚 Bali" });
    mockWriteSync(t, writeOneByte);

    atomicWriteFile(path, initial);
    assert.deepEqual(readFileSync(path), Buffer.from(initial));
    assert.equal(existsSync(backupPathFor(path)), false);

    atomicWriteFile(path, updated);
    assert.deepEqual(readFileSync(path), Buffer.from(updated));
    assert.deepEqual(readFileSync(backupPathFor(path)), Buffer.from(initial));
    assert.deepEqual(readdirSync(dir).sort(), ["store.json", "store.json.bak"]);
  });

  for (const existing of [false, true]) {
    for (const failure of ["zero progress", "ENOSPC"]) {
      it(`aborts on ${failure} after a short write (${existing ? "existing" : "initial"} store)`, (t) => {
        const dir = mkdtempSync(join(dataDir, "failed-write-"));
        const path = join(dir, "store.json");
        const previous = '{"v":1}';
        const backup = '{"v":0}';
        if (existing) {
          writeFileSync(path, previous);
          writeFileSync(backupPathFor(path), backup);
        }

        let calls = 0;
        mockWriteSync(t, (...args) => {
          if (calls++ === 0) return writeOneByte(...args);
          if (failure === "zero progress") return 0;
          throw Object.assign(new Error("no space left on device"), {
            code: "ENOSPC",
          });
        });

        assert.throws(
          () => atomicWriteFile(path, '{"v":2}'),
          failure === "zero progress" ? /no progress/i : { code: "ENOSPC" },
        );
        if (existing) {
          assert.equal(readFileSync(path, "utf8"), previous);
          assert.equal(readFileSync(backupPathFor(path), "utf8"), backup);
        }
        assert.deepEqual(
          readdirSync(dir).sort(),
          existing ? ["store.json", "store.json.bak"] : [],
        );
      });
    }
  }
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
