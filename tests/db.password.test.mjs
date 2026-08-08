import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, isHashed, verifyPassword } from "@nusa/db";

describe("password hashing", () => {
  it("produces a self-describing scrypt hash", async () => {
    const stored = await hashPassword("owner123");
    assert.ok(stored.startsWith("scrypt$"));
    // scrypt$N$r$p$salt$hash
    assert.equal(stored.split("$").length, 6);
    assert.ok(isHashed(stored));
  });

  it("never stores the password itself", async () => {
    const stored = await hashPassword("owner123");
    assert.ok(!stored.includes("owner123"));
  });

  it("salts, so the same password hashes differently each time", async () => {
    const [a, b] = await Promise.all([
      hashPassword("owner123"),
      hashPassword("owner123"),
    ]);
    assert.notEqual(a, b);
  });

  it("verifies the correct password", async () => {
    const stored = await hashPassword("owner123");
    assert.equal(await verifyPassword("owner123", stored), true);
  });

  it("rejects a wrong password", async () => {
    const stored = await hashPassword("owner123");
    assert.equal(await verifyPassword("owner124", stored), false);
    assert.equal(await verifyPassword("", stored), false);
  });

  it("accepts a legacy plaintext entry so old stores still authenticate", async () => {
    assert.equal(isHashed("owner123"), false);
    assert.equal(await verifyPassword("owner123", "owner123"), true);
    assert.equal(await verifyPassword("wrong", "owner123"), false);
  });

  it("rejects a malformed hash rather than throwing", async () => {
    for (const bad of ["scrypt$", "scrypt$1$2$3", "scrypt$a$b$c$d$e"]) {
      assert.equal(await verifyPassword("owner123", bad), false, bad);
    }
  });
});
