import assert from "node:assert/strict";
import { describe, it } from "node:test";

// auth.ts reads NUSA_AUTH_SECRET at module load, so it must be set before the
// import below. A fixed secret keeps token assertions deterministic.
process.env.NUSA_AUTH_SECRET = "test-secret-at-least-16-chars-long";

const { issueToken, verifyToken } = await import("../apps/api/dist/auth.js");

/**
 * The previous scheme was `dev.${user.id}` — forgeable by anyone who could
 * guess a user id. These tests pin the properties that replaced it.
 */

const user = { id: "usr-owner", role: "owner" };

describe("issueToken / verifyToken", () => {
  it("round-trips subject and role", () => {
    const payload = verifyToken(issueToken(user));
    assert.ok(payload);
    assert.equal(payload.sub, "usr-owner");
    assert.equal(payload.role, "owner");
  });

  it("sets an expiry in the future", () => {
    const payload = verifyToken(issueToken(user));
    assert.ok(payload.exp > Math.floor(Date.now() / 1000));
  });

  it("rejects a tampered payload", () => {
    const [, signature] = issueToken(user).split(".");
    const forged = Buffer.from(
      JSON.stringify({
        sub: "usr-admin",
        role: "admin",
        iat: 0,
        exp: 9_999_999_999,
      }),
    )
      .toString("base64url")
      .replace(/=+$/, "");
    assert.equal(verifyToken(`${forged}.${signature}`), null);
  });

  it("rejects a tampered signature", () => {
    const [body] = issueToken(user).split(".");
    assert.equal(verifyToken(`${body}.not-the-real-signature`), null);
  });

  it("rejects the old dev.<id> format", () => {
    assert.equal(verifyToken("dev.usr-admin"), null);
  });

  it("rejects malformed input", () => {
    for (const bad of ["", "onlyonepart", "a.b.c", "..", "null"]) {
      assert.equal(verifyToken(bad), null, `expected null for ${JSON.stringify(bad)}`);
    }
  });

  it("rejects an expired token", () => {
    // Tokens are signed with the real secret, so an expired one can only be
    // produced by issuing with a negative TTL — emulate by hand-rolling the
    // same structure through issueToken with a clock shift.
    const realNow = Date.now;
    Date.now = () => realNow() - 1000 * 60 * 60 * 24 * 365;
    const stale = issueToken(user);
    Date.now = realNow;
    assert.equal(verifyToken(stale), null);
  });

  it("produces a different signature per subject", () => {
    const a = issueToken({ id: "usr-a", role: "owner" });
    const b = issueToken({ id: "usr-b", role: "owner" });
    assert.notEqual(a.split(".")[1], b.split(".")[1]);
  });
});
