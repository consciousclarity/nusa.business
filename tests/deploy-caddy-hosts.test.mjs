/**
 * The host Caddy on the shared VPS avoids a wildcard TLS cert for
 * `*.nusa.business` (would need DNS-01) and instead lists every single-label
 * island/province host explicitly in deploy/caddy/nusa.business.caddy. That
 * list drifted stale after the 38-province rollout (ADR-007): it still had
 * the original ~8-island set, so 34 real provinces 404'd directly from Caddy
 * — the request never even reached the app. Pins the list against the same
 * PLACE_WILDCARD_ISLANDS source of truth the DNS wildcard test already uses.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PLACE_WILDCARD_ISLANDS } from "../scripts/lib/place-wildcard-islands.mjs";

const caddyfile = readFileSync(
  new URL("../deploy/caddy/nusa.business.caddy", import.meta.url),
  "utf8",
);

// Each entry in the apex host list is its own line: "slug.nusa.business," or,
// for the last entry, "slug.nusa.business {". Line-based matching (rather
// than a whole-file regex) avoids false positives from e.g. "riau" matching
// inside the substring "kepulauan-riau.nusa.business".
const hostLines = new Set(
  caddyfile
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[a-z0-9.-]+\.nusa\.business,?\s*\{?$/.test(line))
    .map((line) => line.replace(/[,{\s]+$/, "")),
);

describe("host Caddy island/province host list", () => {
  it("lists every province slug and legacy region hub as a .nusa.business host", () => {
    for (const slug of PLACE_WILDCARD_ISLANDS) {
      assert.ok(
        hostLines.has(`${slug}.nusa.business`),
        `missing top-level host ${slug}.nusa.business in deploy/caddy/nusa.business.caddy`,
      );
    }
  });
});
