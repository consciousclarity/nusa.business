import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { gzipSync } from "node:zlib";

const root = new URL("..", import.meta.url).pathname;
const cssPath = join(root, "apps/web/src/styles/global.css");
const pagesDir = join(root, "apps/web/src/pages");
const listingPath = join(
  root,
  "apps/web/src/pages/host/[label]/[slug].astro",
);
const middlewarePath = join(root, "apps/web/src/middleware.ts");

/** Soft ceiling for source CSS after responsive media queries landed. */
const SOURCE_CSS_MAX = 14_000;
/** Built hashed CSS should stay near the teletype ~10 KB target. */
const BUILT_CSS_MAX = 11_000;
const GZIP_CSS_MAX = 4_000;

function walkAstro(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkAstro(p));
    else if (name.endsWith(".astro")) out.push(p);
  }
  return out;
}

describe("public performance budget (C12)", () => {
  it("ships system fonts only — no @import or third-party font URLs", () => {
    const css = readFileSync(cssPath, "utf8");
    assert.doesNotMatch(css, /@import\s+/);
    assert.doesNotMatch(
      css,
      /fonts\.googleapis|fonts\.gstatic|typekit|use\.typekit/i,
    );
    assert.match(css, /ui-monospace|ui-serif/);
  });

  it("keeps global.css within source and gzip ceilings", () => {
    const buf = readFileSync(cssPath);
    assert.ok(
      buf.length <= SOURCE_CSS_MAX,
      `global.css is ${buf.length} bytes (max ${SOURCE_CSS_MAX})`,
    );
    const gz = gzipSync(buf).length;
    assert.ok(
      gz <= GZIP_CSS_MAX,
      `global.css gzip is ${gz} bytes (max ${GZIP_CSS_MAX})`,
    );
  });

  it("avoids hydrated Astro islands on the public surface", () => {
    for (const file of walkAstro(pagesDir)) {
      const src = readFileSync(file, "utf8");
      assert.doesNotMatch(
        src,
        /client:(load|idle|visible|media|only)/,
        `${file} must not hydrate a client island`,
      );
    }
  });

  it("limits the listing page to one progressive-enhancement script", () => {
    const src = readFileSync(listingPath, "utf8");
    const scripts = src.match(/<script\b/g) || [];
    assert.equal(scripts.length, 1);
    assert.match(src, /define:vars=\{\{\s*apiBase:/);
  });

  it("sets short public Cache-Control on HTML responses", () => {
    const src = readFileSync(middlewarePath, "utf8");
    assert.match(src, /Cache-Control/);
    assert.match(src, /stale-while-revalidate/);
    assert.match(src, /X-Content-Type-Options/);
  });

  it("keeps built CSS under budget when dist is present", () => {
    const client = join(root, "apps/web/dist/client/_astro");
    if (!existsSync(client)) {
      // pretest does not build web; run `npm run build -w @nusa/web` for this gate.
      return;
    }
    const cssFiles = readdirSync(client).filter((f) => f.endsWith(".css"));
    assert.ok(cssFiles.length >= 1, "expected hashed CSS in dist");
    for (const file of cssFiles) {
      const size = statSync(join(client, file)).size;
      assert.ok(
        size <= BUILT_CSS_MAX,
        `${file} is ${size} bytes (max ${BUILT_CSS_MAX})`,
      );
    }
  });
});
