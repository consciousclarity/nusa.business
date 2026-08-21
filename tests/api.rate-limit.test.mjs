import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

const {
  BUSINESS_WRITE_MAX,
  MAX_BUCKETS,
  WRITE_MAX,
  consumeWrite,
  __bucketCount,
  __resetLimiter,
  consume,
  loginEmailKey,
  resolveClientIp,
  sweepBuckets,
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
  it("does NOT trust CF-Connecting-IP by default", () => {
    // The origin is publicly reachable (grey-clouded place hosts need direct
    // ACME), so anyone can connect straight to it and invent this header.
    // Caddy passes it through untouched. Trusting it would hand an attacker a
    // fresh bucket per request.
    const ip = resolveClientIp(
      ctx({
        "CF-Connecting-IP": "203.0.113.9",
        "X-Forwarded-For": "198.51.100.1, 172.16.0.1",
      }),
    );
    assert.equal(ip, "172.16.0.1", "must use the Caddy-observed peer");
    assert.notEqual(ip, "203.0.113.9");
  });

  it("cannot be escaped by rotating CF-Connecting-IP", () => {
    const keys = new Set(
      ["a", "b", "c", "d"].map((n) =>
        resolveClientIp(
          ctx({
            "CF-Connecting-IP": `10.0.0.${n.charCodeAt(0)}`,
            "X-Forwarded-For": "203.0.113.7",
          }),
        ),
      ),
    );
    // Four different spoofed headers, one real peer — one bucket.
    assert.deepEqual([...keys], ["203.0.113.7"]);
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

describe("bucket reclamation", () => {
  beforeEach(() => __resetLimiter());

  it("drops buckets whose hits have aged out", () => {
    const now = 1_000_000;
    for (let i = 0; i < 50; i++) consume(`ip:${i}`, 5, 1000, now);
    assert.equal(__bucketCount(), 50);

    // Longest configured window is the write window (1h by default), so sweep
    // past it rather than past the 1000ms limit used above.
    sweepBuckets(now + 1000 * 60 * 60 * 2);
    assert.equal(__bucketCount(), 0, "expired buckets must be reclaimed");
  });

  it("keeps buckets that are still inside the window", () => {
    const now = 1_000_000;
    consume("ip:live", 5, 1000, now);
    sweepBuckets(now + 1000);
    assert.equal(__bucketCount(), 1);
  });

  it("stays bounded under a high-cardinality flood", () => {
    // The login route keys partly on a client-supplied email, so an attacker
    // can mint unlimited distinct keys. Memory must not grow with them.
    const now = 1_000_000;
    const flood = MAX_BUCKETS + 5_000;
    for (let i = 0; i < flood; i++) {
      consume(`login-email:user${i}@example.com`, 5, 60_000, now);
    }
    assert.ok(
      __bucketCount() <= MAX_BUCKETS,
      `expected <= ${MAX_BUCKETS}, got ${__bucketCount()}`,
    );
  });

  it("still limits correctly while sweeping runs", () => {
    const now = 1_000_000;
    for (let i = 0; i < 600; i++) consume(`noise:${i}`, 5, 60_000, now);
    for (let i = 0; i < 3; i++) {
      assert.equal(consume("real", 3, 60_000, now).allowed, true);
    }
    assert.equal(consume("real", 3, 60_000, now).allowed, false);
  });
});

describe("public write limits are scoped to the listing", () => {
  beforeEach(() => __resetLimiter());

  it("does not let one attacker 429 a bystander on a different listing", () => {
    // With CF-Connecting-IP untrusted, proxied clients share a Cloudflare edge
    // address. A client-only key would make this a denial-of-service vector.
    const edge = "203.0.113.7";
    for (let i = 0; i < WRITE_MAX; i++) {
      assert.equal(consumeWrite("reviews", edge, "biz-target").allowed, true);
    }
    assert.equal(
      consumeWrite("reviews", edge, "biz-target").allowed,
      false,
      "attacker's own listing should be capped",
    );
    assert.equal(
      consumeWrite("reviews", edge, "biz-other").allowed,
      true,
      "a bystander behind the same edge, on another listing, must be unaffected",
    );
  });

  it("still caps a single listing flooded from many addresses", () => {
    let allowed = 0;
    for (let i = 0; i < BUSINESS_WRITE_MAX + 20; i++) {
      // A fresh address each time — only the per-listing cap can stop this.
      if (consumeWrite("reviews", `198.51.100.${i}`, "biz-target").allowed) {
        allowed++;
      }
    }
    assert.equal(allowed, BUSINESS_WRITE_MAX);
  });

  it("keeps routes independent", () => {
    const edge = "203.0.113.7";
    for (let i = 0; i < WRITE_MAX; i++) consumeWrite("reviews", edge, "biz-a");
    assert.equal(consumeWrite("reviews", edge, "biz-a").allowed, false);
    assert.equal(
      consumeWrite("bookings", edge, "biz-a").allowed,
      true,
      "booking quota must not be consumed by reviews",
    );
  });
});
