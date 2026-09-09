/**
 * Copy MapLibre GL JS's published build into `public/vendor/` so the listing
 * map can be fetched on demand instead of bundled.
 *
 * Importing it from the page would put its JS and stylesheet into the
 * listing route's eager bundle, which the public performance budget
 * (tests/web.perf-budget.test.mjs) rejects — see docs/engineering/performance.md.
 * Serving it from our own origin keeps the teletype page weight for readers
 * who never open the map, with no CDN or third-party script origin.
 *
 * MapLibre ships ESM only (no UMD/global build): `maplibre-gl.mjs` imports
 * `./maplibre-gl-shared.mjs` by a relative specifier, and spawns
 * `./maplibre-gl-worker.mjs` as a module Worker resolved the same way. All
 * three must be copied together, with their filenames unchanged, so those
 * relative URLs keep resolving once served from public/vendor/.
 *
 * Runs from `prebuild`, so the version tracked in package.json stays the
 * single source of truth and nothing vendored is committed.
 */
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const mapDist = dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));
const out = new URL("../public/vendor/maplibre/", import.meta.url);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// The map uses a plain circle layer (no symbol/text layers), so no glyphs
// or sprite sheet is ever requested — these four files are everything it
// needs. Source maps are skipped; a missing one just disables unminified
// devtools stack traces, no functional effect.
for (const file of [
  "maplibre-gl.mjs",
  "maplibre-gl-shared.mjs",
  "maplibre-gl-worker.mjs",
  "maplibre-gl.css",
]) {
  copyFileSync(join(mapDist, file), new URL(file, out));
}

console.log(`[vendor] maplibre-gl -> ${out.pathname}`);
