/**
 * Copy Leaflet's published build into `public/vendor/` so the listing map can
 * be fetched on demand instead of bundled.
 *
 * Importing Leaflet from the page would put ~148 KB of JS and its 14.8 KB
 * stylesheet into the listing route's eager bundle, which the public
 * performance budget (tests/web.perf-budget.test.mjs) rejects — see
 * docs/engineering/performance.md. Serving it from our own origin keeps the
 * teletype page weight for readers who never open the map, with no CDN or
 * third-party script origin.
 *
 * Runs from `prebuild`, so the version tracked in package.json stays the
 * single source of truth and nothing vendored is committed.
 */
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const leafletDist = dirname(require.resolve("leaflet/dist/leaflet.js"));
const out = new URL("../public/vendor/leaflet/", import.meta.url);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Only the minified UMD build and its stylesheet: the map uses circleMarker,
// so Leaflet's marker sprite images are never requested.
for (const file of ["leaflet.js", "leaflet.css"]) {
  copyFileSync(join(leafletDist, file), new URL(file, out));
}

console.log(`[vendor] leaflet -> ${out.pathname}`);
