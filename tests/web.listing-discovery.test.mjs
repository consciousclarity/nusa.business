import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/**
 * Structural guards for three review findings on the listing discovery
 * panels. Behaviour was verified in Chromium (locale-correct links after a
 * category switch, the map seeded from the server, and a 503 on the
 * discovery endpoint leaving the page at 200); these assertions are the
 * cheap tripwires that catch the specific shapes that regressed, not a
 * substitute for that.
 */
const listing = new URL(
  "../apps/web/src/pages/host/[label]/[...path].astro",
  import.meta.url,
);

describe("listing discovery wiring", () => {
  const src = readFileSync(listing, "utf8");
  const script = src.match(/<script define:vars=[^>]*>([\s\S]*?)<\/script>/)[1];

  it("builds neighbour links from the server template, not a fixed path", () => {
    // A hardcoded `/host/...` drops the /id prefix and bypasses the
    // canonical tenant host on production.
    assert.doesNotMatch(
      script,
      /`\/host\/\$\{/,
      "discovery links must come from data-href-template",
    );
    assert.match(script, /root\.dataset\.hrefTemplate/);
    for (const token of ["x-place-x", "x-island-x", "x-area-x", "x-slug-x"]) {
      assert.match(script, new RegExp(token), `template token ${token}`);
      assert.match(src, new RegExp(token), `${token} must be produced server-side`);
    }
  });

  it("substitutes href tokens in a single pass", () => {
    // Chained replaces re-scan text they just inserted, so a place slug
    // reading "x-slug-x" rewrote the hostname and pointed the link at the
    // wrong tenant.
    assert.doesNotMatch(script, /\.replaceAll\("x-(?:place|island|slug)-x"/);
    assert.match(script, /replace\(\s*\/x-\(\?:place\|island\|slug\)-x\/g/);
  });

  it("seeds the map from the server-rendered set", () => {
    // Without a seed the map opens on the fallback view with no markers and
    // only agrees with the list after a category chip is clicked.
    assert.match(script, /root\.dataset\.initial/);
    assert.match(src, /data-initial=\{nearbySeed\}/);
    const seed = src.slice(
      src.indexOf("const nearbySeed"),
      src.indexOf("const nearbyWithHref"),
    );
    assert.match(seed, /discovery\.nearby\.map/);
    assert.doesNotMatch(seed, /bookingMode/);
  });

  it("keeps a discovery outage from taking down the listing", () => {
    // `api()` throws on non-2xx and on network errors.
    assert.match(src, /\/discovery`,\s*\)\.catch\(\(\) => emptyDiscovery\)/);
  });

  it("renders the nearby map whenever the listing has an origin", () => {
    // Neighbours are optional; a lone pin still needs the map. Gating on
    // nearbyCategories omitted the panel on production listings that had
    // coords but no in-radius peers (and on origin-null stores, the whole
    // map disappeared).
    assert.match(
      src,
      /discovery\.origin && \(/,
    );
    assert.doesNotMatch(
      src,
      /discovery\.origin && discovery\.nearbyCategories\.length > 0/,
    );
  });
});
