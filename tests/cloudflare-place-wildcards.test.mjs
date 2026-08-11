/**
 * Place hosts ({place}.{island}.nusa.business) need a grey-cloud A record
 * `*.{island}.nusa.business`. After island slug renames (jawa→java,
 * sumatera→sumatra), stale wildcards leave the new hosts falling through to
 * the orange `*` record — Cloudflare Universal SSL cannot terminate TLS for
 * two-label hosts, so https://jakarta.java.nusa.business/ handshake-fails.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  OBSOLETE_PLACE_WILDCARD_ISLANDS,
  PLACE_WILDCARD_ISLANDS,
  placeWildcardName,
} from "../scripts/lib/place-wildcard-islands.mjs";

describe("place wildcard islands", () => {
  it("covers every current seed island slug (java/sumatra, not jawa/sumatera)", () => {
    assert.deepEqual(
      [...PLACE_WILDCARD_ISLANDS].sort(),
      [
        "bali",
        "java",
        "kalimantan",
        "lombok",
        "maluku",
        "papua",
        "sulawesi",
        "sumatra",
      ],
    );
    assert.ok(!PLACE_WILDCARD_ISLANDS.includes("jawa"));
    assert.ok(!PLACE_WILDCARD_ISLANDS.includes("sumatera"));
  });

  it("lists obsolete renamed slugs so cf:zone can delete stale DNS wildcards", () => {
    assert.deepEqual(
      [...OBSOLETE_PLACE_WILDCARD_ISLANDS].sort(),
      ["jawa", "sumatera"],
    );
    for (const obsolete of OBSOLETE_PLACE_WILDCARD_ISLANDS) {
      assert.ok(
        !PLACE_WILDCARD_ISLANDS.includes(obsolete),
        `${obsolete} must not remain in the live wildcard list`,
      );
    }
  });

  it("builds Cloudflare record names for the zone", () => {
    assert.equal(
      placeWildcardName("java", "nusa.business"),
      "*.java.nusa.business",
    );
    assert.equal(
      placeWildcardName("jawa", "nusa.business"),
      "*.jawa.nusa.business",
    );
  });
});
