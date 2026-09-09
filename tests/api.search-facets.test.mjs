import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, before } from "node:test";

process.env.NUSA_DATA_DIR = mkdtempSync(join(tmpdir(), "nusa-search-facets-"));
process.env.NUSA_ALLOW_DEMO_SEED = "1";
process.env.NUSA_AUTH_SECRET = "test-secret-at-least-16-chars-long";
process.env.NODE_ENV = "test";

const { resetSeed } = await import("@nusa/db");
resetSeed();
const { app } = await import("../apps/api/dist/app.js");

async function json(path) {
  const res = await app.request(path);
  return { status: res.status, data: await res.json() };
}

describe("search facet query params", () => {
  it("filters by cuisine and returns public facets", async () => {
    const { status, data } = await json(
      "/v1/search?island=bali&place=ubud&category=warungs-local-food&cuisine=balinese",
    );
    assert.equal(status, 200);
    assert.ok(data.results.some((r) => r.business.slug === "warung-babi-guling-ibu-oka"));
    const ibu = data.results.find((r) => r.business.slug === "warung-babi-guling-ibu-oka");
    assert.ok(ibu.business.facets.cuisine.includes("balinese"));
  });

  it("exposes the facet catalog on meta", async () => {
    const { status, data } = await json("/v1/meta/categories");
    assert.equal(status, 200);
    assert.ok(data.facets.global.some((f) => f.key === "price_level"));
    assert.ok(data.facets.byGroup["food-drink"].some((f) => f.key === "cuisine"));
    assert.ok(data.facets.indexable.some((r) => r.facet === "cuisine"));
  });
});
