import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, before } from "node:test";
import { geoNesting, publicHostLine } from "@nusa/shared";

describe("seed geography follows administrative hosts", () => {
  before(() => {
    process.env.NUSA_DATA_DIR = mkdtempSync(join(tmpdir(), "nusa-geo-nest-"));
    process.env.NUSA_ALLOW_DEMO_SEED = "1";
  });

  it("places Ubud under Gianyar so Ibu Oka is gianyar.bali/ubud/…", async () => {
    const { resetSeed, getPlace, getBusiness, listPlaces } = await import(
      "@nusa/db"
    );
    resetSeed();
    const ubud = getPlace("bali", "ubud");
    const gianyar = getPlace("bali", "gianyar");
    assert.ok(ubud);
    assert.ok(gianyar);
    assert.equal(ubud.parentPlaceId, gianyar.id);
    const byId = Object.fromEntries(listPlaces("bali").map((p) => [p.id, p]));
    const nest = geoNesting(ubud, byId);
    const biz = getBusiness("bali", "ubud", "warung-babi-guling-ibu-oka");
    assert.ok(biz);
    assert.equal(
      publicHostLine({
        island: "bali",
        place: nest.hostPlace,
        area: nest.area,
        slug: biz.slug,
      }),
      "gianyar.bali.nusa.business/ubud/warung-babi-guling-ibu-oka",
    );
  });

  it("places Canggu and Uluwatu under Badung", async () => {
    const { resetSeed, getPlace } = await import("@nusa/db");
    resetSeed();
    const badung = getPlace("bali", "badung");
    assert.ok(badung);
    assert.equal(getPlace("bali", "canggu")?.parentPlaceId, badung.id);
    assert.equal(getPlace("bali", "uluwatu")?.parentPlaceId, badung.id);
  });
});
