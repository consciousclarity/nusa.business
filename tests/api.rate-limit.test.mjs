import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

const {
  __resetLimiter,
  consume,
  loginEmailKey,
  resolveClientIp,
} = await import("../apps/api/dist/rate-limit.js");

/** Minimal stand-in for a Hono Context — resolveClientIp only reads headers. */
function ctx(headers) {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return { req: { header: (name) => lower[name.toLowerCase()] } };
}

describe("consume", () => {
  beforeEach(() => __resetLimiter());

  it("allows up to the limit, then blocks", () => {
    for (let i = 0; i < 3; i++) {
      assert.equal(consume("k", 3, 1000).allowed, true, `hit ${i + 1}`);
    }
    assert.equal(consume("k", 3, 1000).allowed, false);
  });

  it("reports a positive Retry-After when blocked", () => {
    const now = 1_000_000;
    for (let i = 0; i < 2; i++) consume("k", 2, 60_000, now);
    const blocked = consume("k", 2, 60_000, now);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfter > 0 && blocked.retryAfter <= 60);
  });

  it("releases once the window has passed", () => {
    const now = 1_000_000;
    for (let i = 0; i < 2; i++) consume("k", 2, 1000, now);
    assert.equal(consume("k", 2, 1000, now).allowed, false);
    // A clock is injected rather than sleeping, so the suite stays fast.
    assert.equal(consume("k", 2, 1000, now + 1001).allowed, true);
  });

  it("slides rather than resetting in fixed blocks", () => {
    const now = 1_000_000;
    consume("k", 2, 1000, now);
    consume("k", 2, 1000, now + 900);
    // The first hit has aged out, the second has not — room for exactly one.
    assert.equal(consume("k", 2, 1000, now + 1001).allowed, true);
    assert.equal(consume("k", 2, 1000, now + 1002).allowed, false);
  });

  it("keeps separate buckets independent", () => {
    for (let i = 0; i < 2; i++) consume("a", 2, 1000);
    assert.equal(consume("a", 2, 1000).allowed, false);
    assert.equal(consume("b", 2, 1000).allowed, true);
  });
});

describe("resolveClientIp", () => {
  it("prefers CF-Connecting-IP on Cloudflare-proxied hosts", () => {
    const ip = resolveClientIp(
      ctx({
        "CF-Connecting-IP": "203.0.113.9",
        "X-Forwarded-For": "198.51.100.1, 172.16.0.1",
      }),
    );
    assert.equal(ip, "203.0.113.9");
  });

  it("takes the RIGHTMOST X-Forwarded-For entry", () => {
    // Caddy appends, so the last entry is the one it observed.
    assert.equal(
      resolveClientIp(ctx({ "X-Forwarded-For": "198.51.100.1, 203.0.113.7" })),
      "203.0.113.7",
    );
  });

  it("ignores a spoofed leftmost entry — the bypass test", () => {
    // A client sending its own XFF gets Caddy's real observation appended
    // after it. Keying on the leftmost value would let an attacker rotate a
    // header and evade the limit entirely.
    const spoofed = resolveClientIp(
      ctx({ "X-Forwarded-For": "1.1.1.1, 2.2.2.2, 203.0.113.7" }),
    );
    assert.equal(spoofed, "203.0.113.7");
    assert.notEqual(spoofed, "1.1.1.1");
  });

  it("handles a single-entry header and stray whitespace", () => {
    assert.equal(
      resolveClientIp(ctx({ "X-Forwarded-For": "  203.0.113.7  " })),
      "203.0.113.7",
    );
  });

  it("falls back to a constant when no proxy headers are present", () => {
    assert.equal(resolveClientIp(ctx({})), "unknown");
  });
});

describe("loginEmailKey", () => {
  it("normalises case and whitespace so one account is one bucket", () => {
    assert.equal(loginEmailKey("  Admin@Nusa.Business "), "admin@nusa.business");
  });

  it("does not throw on a non-string", () => {
    assert.equal(loginEmailKey(undefined), "unknown");
    assert.equal(loginEmailKey(42), "unknown");
  });
});
