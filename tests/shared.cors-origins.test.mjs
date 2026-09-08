import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseCorsOriginAllowlist,
  resolveCorsAllowOrigin,
} from "@nusa/shared";

describe("parseCorsOriginAllowlist", () => {
  it("keeps exact origins and drops junk", () => {
    assert.deepEqual(
      parseCorsOriginAllowlist(
        " https://portal.example.test ,http://localhost:5173, not-a-url, https://evil.test/path ",
      ),
      ["https://portal.example.test", "http://localhost:5173"],
    );
  });
});

describe("resolveCorsAllowOrigin", () => {
  it("denies reflection when Origin is absent or malformed", () => {
    assert.equal(
      resolveCorsAllowOrigin(undefined, { production: false }),
      null,
    );
    assert.equal(resolveCorsAllowOrigin("", { production: true }), null);
    assert.equal(
      resolveCorsAllowOrigin("not-a-url", { production: false }),
      null,
    );
  });

  it("allows loopback frontends only outside production", () => {
    assert.equal(
      resolveCorsAllowOrigin("http://localhost:5173", { production: false }),
      "http://localhost:5173",
    );
    assert.equal(
      resolveCorsAllowOrigin("http://127.0.0.1:4321", { production: false }),
      "http://127.0.0.1:4321",
    );
    assert.equal(
      resolveCorsAllowOrigin("http://localhost:5173", { production: true }),
      null,
    );
  });

  it("allows apex and nested geo hosts over https", () => {
    for (const origin of [
      "https://nusa.business",
      "https://portal.nusa.business",
      "https://bali.nusa.business",
      "https://gianyar.bali.nusa.business",
    ]) {
      assert.equal(
        resolveCorsAllowOrigin(origin, { production: true }),
        origin,
        origin,
      );
    }
  });

  it("rejects foreign origins and http apex in production", () => {
    assert.equal(
      resolveCorsAllowOrigin("https://evil.example", { production: true }),
      null,
    );
    assert.equal(
      resolveCorsAllowOrigin("https://nusa.business.evil.test", {
        production: true,
      }),
      null,
    );
    assert.equal(
      resolveCorsAllowOrigin("http://bali.nusa.business", { production: true }),
      null,
    );
  });

  it("honours NUSA_CORS_ORIGINS extras", () => {
    assert.equal(
      resolveCorsAllowOrigin("https://preview.pages.dev", {
        production: true,
        extraOrigins: parseCorsOriginAllowlist(
          "https://preview.pages.dev,https://other.test",
        ),
      }),
      "https://preview.pages.dev",
    );
  });
});
