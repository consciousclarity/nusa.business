import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { haversineKm, normalizeAddress } from "@nusa/shared";

describe("normalizeAddress", () => {
  it("collapses case and punctuation for co-location", () => {
    assert.equal(
      normalizeAddress("Jl. Ngurah Rai 12, Gianyar"),
      normalizeAddress("jl ngurah rai 12 gianyar"),
    );
  });

  it("returns null for empty", () => {
    assert.equal(normalizeAddress("  "), null);
    assert.equal(normalizeAddress(undefined), null);
  });
});

describe("haversineKm", () => {
  it("measures short Gianyar offsets under 2 km", () => {
    const d = haversineKm(-8.5439, 115.325, -8.5455, 115.3275);
    assert.ok(d > 0 && d < 2);
  });

  it("places Ubud outside a 2 km Gianyar radius", () => {
    const d = haversineKm(-8.5439, 115.325, -8.5069, 115.2625);
    assert.ok(d > 2);
  });
});
