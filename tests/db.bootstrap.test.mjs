import assert from "node:assert/strict";
import { mkdtempSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, before } from "node:test";

/**
 * C02 — production bootstrap safety.
 * Each case uses a fresh NUSA_DATA_DIR. Env is set before importing @nusa/db.
 */

process.env.NUSA_AUTH_SECRET = "test-secret-at-least-16-chars-long";

describe("production bootstrap (no demo seed)", () => {
  let dataDir;

  before(() => {
    dataDir = mkdtempSync(join(tmpdir(), "nusa-c02-prod-"));
    process.env.NUSA_DATA_DIR = dataDir;
    process.env.NODE_ENV = "production";
    delete process.env.NUSA_ALLOW_DEMO_SEED;
    delete process.env.NUSA_BOOTSTRAP_ADMIN_EMAIL;
    delete process.env.NUSA_BOOTSTRAP_ADMIN_PASSWORD;
  });

  it("refuses to create a store without bootstrap admin", async () => {
    const { getStore } = await import("../packages/db/dist/repository.js");
    assert.throws(() => getStore(), /NUSA_BOOTSTRAP_ADMIN/);
    assert.equal(existsSync(join(dataDir, "store.json")), false);
  });
});

describe("production bootstrap with admin", () => {
  let dataDir;

  before(() => {
    dataDir = mkdtempSync(join(tmpdir(), "nusa-c02-boot-"));
    process.env.NUSA_DATA_DIR = dataDir;
    process.env.NODE_ENV = "production";
    delete process.env.NUSA_ALLOW_DEMO_SEED;
    process.env.NUSA_BOOTSTRAP_ADMIN_EMAIL = "ops@example.test";
    process.env.NUSA_BOOTSTRAP_ADMIN_PASSWORD = "bootstrap-password-16";
    process.env.NUSA_BOOTSTRAP_ADMIN_NAME = "Ops Admin";
  });

  it("creates geography-only store with one admin and no demo accounts", async () => {
    // Fresh import path: repository reads env at call time for data dir,
    // but the module may already be cached from the previous suite.
    const { getStore, allowDemoSeed, hashStoredPasswords, authenticate } =
      await import("../packages/db/dist/repository.js");
    const { DEMO_ACCOUNT_EMAILS } = await import(
      "../packages/db/dist/seed-data.js"
    );

    assert.equal(allowDemoSeed(), false);
    const store = getStore();
    assert.ok(store.islands.length >= 1);
    assert.ok(store.places.length >= 1);
    assert.equal(store.businesses.length, 0);
    assert.equal(store.reviews.length, 0);
    assert.equal(store.bookings.length, 0);
    assert.equal(store.vendors.length, 0);
    assert.equal(store.users.length, 1);
    assert.equal(store.users[0].email, "ops@example.test");
    assert.equal(store.users[0].role, "admin");
    for (const email of DEMO_ACCOUNT_EMAILS) {
      assert.equal(
        store.users.some((u) => u.email === email),
        false,
        `must not create demo account ${email}`,
      );
    }

    await hashStoredPasswords();
    const user = await authenticate("ops@example.test", "bootstrap-password-16");
    assert.ok(user);
    assert.equal(user.role, "admin");
  });
});

describe("existing store is preserved", () => {
  let dataDir;

  before(() => {
    dataDir = mkdtempSync(join(tmpdir(), "nusa-c02-keep-"));
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(
      join(dataDir, "store.json"),
      JSON.stringify({
        islands: [],
        places: [],
        businesses: [],
        users: [
          {
            id: "usr-real",
            email: "admin@nusa.business",
            name: "Real Admin Who Happens To Share Demo Email",
            role: "admin",
            password: "already-here",
          },
        ],
        claims: [],
        reviews: [],
        bookings: [],
        vendors: [],
      }),
    );
    process.env.NUSA_DATA_DIR = dataDir;
    process.env.NODE_ENV = "production";
    delete process.env.NUSA_ALLOW_DEMO_SEED;
    delete process.env.NUSA_BOOTSTRAP_ADMIN_EMAIL;
    delete process.env.NUSA_BOOTSTRAP_ADMIN_PASSWORD;
  });

  it("does not replace or delete an existing store", async () => {
    const { getStore } = await import("../packages/db/dist/repository.js");
    const store = getStore();
    assert.equal(store.users.length, 1);
    assert.equal(store.users[0].id, "usr-real");
    assert.equal(store.users[0].password, "already-here");
    const raw = readFileSync(join(dataDir, "store.json"), "utf8");
    assert.match(raw, /usr-real/);
  });
});

describe("development default still demo-seeds", () => {
  let dataDir;

  before(() => {
    dataDir = mkdtempSync(join(tmpdir(), "nusa-c02-dev-"));
    process.env.NUSA_DATA_DIR = dataDir;
    process.env.NODE_ENV = "development";
    delete process.env.NUSA_ALLOW_DEMO_SEED;
    delete process.env.NUSA_BOOTSTRAP_ADMIN_EMAIL;
    delete process.env.NUSA_BOOTSTRAP_ADMIN_PASSWORD;
  });

  it("creates the familiar demo catalog when store is missing", async () => {
    const { getStore, allowDemoSeed } = await import(
      "../packages/db/dist/repository.js"
    );
    assert.equal(allowDemoSeed(), true);
    const store = getStore();
    assert.ok(store.businesses.length > 0);
    assert.ok(store.users.some((u) => u.email === "owner@example.com"));
  });
});
