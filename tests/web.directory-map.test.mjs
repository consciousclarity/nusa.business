import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = new URL("..", import.meta.url).pathname;

function src(rel) {
  return readFileSync(join(root, rel), "utf8");
}

describe("directory maps", () => {
  it("places a lazy Leaflet map on directory surfaces", () => {
    assert.match(src("apps/web/src/pages/index.astro"), /DirectoryMap/);
    assert.match(src("apps/web/src/pages/host/[label]/index.astro"), /DirectoryMap/);
    assert.match(src("apps/web/src/components/PlaceDirectory.astro"), /DirectoryMap/);
    assert.match(src("apps/web/src/pages/search.astro"), /DirectoryMap/);
    assert.match(src("apps/web/src/components/CategoryBrowse.astro"), /DirectoryMap/);
    assert.match(
      src("apps/web/src/pages/host/[label]/[...path].astro"),
      /mapLocation/,
    );
  });

  it("does not put a directory map on legal or error pages", () => {
    for (const file of [
      "apps/web/src/pages/privacy.astro",
      "apps/web/src/pages/terms.astro",
      "apps/web/src/pages/support.astro",
      "apps/web/src/pages/claim.astro",
      "apps/web/src/pages/404.astro",
      "apps/web/src/pages/500.astro",
    ]) {
      assert.doesNotMatch(src(file), /DirectoryMap/);
    }
  });
});
