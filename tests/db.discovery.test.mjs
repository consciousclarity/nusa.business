import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, before } from "node:test";

describe("business discovery", () => {
  before(() => {
    process.env.NUSA_DATA_DIR = mkdtempSync(join(tmpdir(), "nusa-disc-"));
    process.env.NUSA_ALLOW_DEMO_SEED = "1";
  });

  it("returns same-address and nearby category peers for Gianyar seed", async () => {
    const { resetSeed, getBusinessDiscovery, getBusinessById } = await import(
      "@nusa/db"
    );
    resetSeed();
    const self = getBusinessById("biz-pande-egi");
    assert.ok(self);
    const disc = getBusinessDiscovery(self.id, {
      radiusKm: 2,
      category: "Professional Services",
    });
    assert.ok(disc);
    assert.equal(disc.sameAddress.length >= 1, true);
    assert.ok(disc.sameAddress.some((n) => n.business.slug === "kopi-ngurah-rai"));
    assert.ok(disc.similar.some((n) => n.business.slug === "warung-pasar-gianyar"));
    assert.equal(disc.activeCategory, "Professional Services");
    assert.ok(disc.nearby.some((n) => n.business.slug === "bpr-gianyar-pusat"));
    assert.ok(!disc.nearby.some((n) => n.business.slug === "warung-babi-guling-ibu-oka"));
  });
});
