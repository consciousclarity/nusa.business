import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { gzipSync } from "node:zlib";

const root = new URL("..", import.meta.url).pathname;
const cssPath = join(root, "apps/web/src/styles/global.css");
const pagesDir = join(root, "apps/web/src/pages");
const listingPagePath = join(
  root,
  "apps/web/src/pages/host/[label]/[...path].astro",
);
const listingPath = join(
  root,
  "apps/web/src/components/ListingRecord.astro",
);
const middlewarePath = join(root, "apps/web/src/middleware.ts");

/** Soft ceiling for source CSS after responsive media queries landed. */
const SOURCE_CSS_MAX = 14_000;
/** Built hashed CSS should stay near the teletype ~10 KB target. */
const BUILT_CSS_MAX = 11_000;
const GZIP_CSS_MAX = 4_000;

/**
 * The built middleware is the only place the wrapper actually runs, so the
 * header assertions drive it directly. CI builds the web app before `npm
 * test`; locally run `npm run build -w @nusa/web` to exercise these.
 */
async function builtMiddleware() {
  const built = join(
    root,
    "apps/web/dist/server/_astro-internal_middleware.mjs",
  );
  if (!existsSync(built)) return null;
  const { onRequest } = await import(built);
  return onRequest;
}

/** Minimal Astro middleware context for a public tenant request. */
function context(pathname, host = "gianyar.bali.nusa.business") {
  const url = new URL(`https://${host}${pathname}`);
  return {
    url,
    locals: {},
    request: new Request(url, { headers: { host } }),
    redirect: (location, status = 302) =>
      new Response(null, { status, headers: { location } }),
  };
}

function html(body = "<!doctype html><title>teletype</title>") {
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

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
    const page = readFileSync(listingPagePath, "utf8");
    assert.equal((page.match(/<script\b/g) || []).length, 0);
  });

  it("routes every middleware response through the header wrapper", () => {
    const src = readFileSync(middlewarePath, "utf8");
    // A bare `return next(...)` would silently skip the headers, so the
    // wiring is asserted here as well as behaviourally below.
    const bare = src.match(/return\s+(?:await\s+)?next\(/g) || [];
    assert.deepEqual(bare, [], "every next() must go through withPerfHeaders");
    assert.match(src, /withPerfHeaders\(await next\(/);
  });

  it("sets short public Cache-Control on real HTML responses", async () => {
    const middleware = await builtMiddleware();
    if (!middleware) return;

    const res = await middleware(context("/"), () => html());
    assert.equal(res.status, 200);
    assert.equal(
      res.headers.get("cache-control"),
      "public, max-age=60, stale-while-revalidate=600",
    );
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.match(await res.text(), /<title>/);
  });

  it("sets the headers on every routing branch, in both locales", async () => {
    const middleware = await builtMiddleware();
    if (!middleware) return;

    // One row per place the middleware can return a response: tenant
    // rewrites, the /host passthrough and the nation apex, each with and
    // without the /id prefix. A branch that forgets the wrapper fails here.
    const branches = [];
    for (const prefix of ["", "/id"]) {
      branches.push(
        [`${prefix}/`, "gianyar.bali.nusa.business"], // place rewrite
        [`${prefix}/`, "bali.nusa.business"], // island rewrite
        [`${prefix}/`, "nusa.business"], // nation apex, no rewrite
        [`${prefix}/host/gianyar.bali`, "gianyar.bali.nusa.business"], // /host
      );
    }

    for (const [pathname, host] of branches) {
      const res = await middleware(context(pathname, host), () => html());
      assert.equal(
        res.headers.get("cache-control"),
        "public, max-age=60, stale-while-revalidate=600",
        `${host}${pathname} lost Cache-Control`,
      );
      assert.equal(
        res.headers.get("x-content-type-options"),
        "nosniff",
        `${host}${pathname} lost nosniff`,
      );
    }
  });

  it("does not cache non-HTML responses, but still sends nosniff", async () => {
    const middleware = await builtMiddleware();
    if (!middleware) return;

    const res = await middleware(
      context("/sitemap.xml"),
      () =>
        new Response("<urlset/>", {
          status: 200,
          headers: { "content-type": "application/xml" },
        }),
    );
    assert.equal(res.headers.get("cache-control"), null);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  });

  it("leaves a route's own Cache-Control and error responses alone", async () => {
    const middleware = await builtMiddleware();
    if (!middleware) return;

    const own = await middleware(
      context("/"),
      () =>
        new Response("<!doctype html>", {
          status: 200,
          headers: {
            "content-type": "text/html",
            "cache-control": "no-store",
          },
        }),
    );
    assert.equal(own.headers.get("cache-control"), "no-store");

    const boom = await middleware(
      context("/"),
      () =>
        new Response("boom", {
          status: 500,
          headers: { "content-type": "text/html" },
        }),
    );
    assert.equal(boom.headers.get("cache-control"), null);
    assert.equal(boom.headers.get("x-content-type-options"), null);
  });

  it("keeps the map library out of the eager bundle", () => {
    const client = join(root, "apps/web/dist/client");
    if (!existsSync(join(client, "_astro"))) {
      // pretest does not build web; run `npm run build -w @nusa/web`.
      return;
    }
    // Importing Leaflet from the page would bundle ~148 KB of JS and its
    // 14.8 KB stylesheet into the listing route. It is served from
    // public/vendor instead and fetched only when the map scrolls into view.
    const bundled = readdirSync(join(client, "_astro")).filter((f) =>
      /leaflet/i.test(f),
    );
    assert.deepEqual(bundled, [], "Leaflet must not be bundled into _astro");

    for (const file of ["leaflet.js", "leaflet.css"]) {
      assert.ok(
        existsSync(join(client, "vendor/leaflet", file)),
        `expected on-demand ${file} in public/vendor`,
      );
    }

    const src = readFileSync(listingPath, "utf8");
    assert.doesNotMatch(
      src,
      /from\s+["']leaflet|import\s+["']leaflet/,
      "listing page must not import Leaflet through the bundler",
    );
    assert.match(src, /\/vendor\/leaflet\/leaflet\.js/);

    const mapComponent = join(
      root,
      "apps/web/src/components/DirectoryMap.astro",
    );
    const mapSrc = readFileSync(mapComponent, "utf8");
    assert.doesNotMatch(mapSrc, /from\s+["']leaflet|import\s+["']leaflet/);
    assert.match(mapSrc, /\/vendor\/leaflet\/leaflet\.js/);
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
