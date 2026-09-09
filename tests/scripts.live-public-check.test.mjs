import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const script = readFileSync(
  new URL("../scripts/live-public-check.sh", import.meta.url),
  "utf8",
);

describe("live public check script", () => {
  it("is read-only and refuses to deploy", () => {
    assert.match(script, /Does not deploy/);
    assert.doesNotMatch(script, /\bgit push\b/);
    assert.doesNotMatch(script, /\bpm2 (restart|reload)\b/);
  });

  it("asserts visitor chrome and browser API origin on live HTML", () => {
    assert.match(script, /class="resolver"/);
    assert.match(script, /kind=nation/);
    assert.match(script, /http:\/\/api:8787/);
    assert.match(script, /https:\/\/api\.nusa\.business/);
    assert.match(script, /nusa\.business\//);
    assert.match(script, /nusa\.business\/id/);
    assert.match(script, /name="q"/);
    assert.match(script, /nav-search/);
    assert.match(script, /Pulau Dewata/);
    assert.match(script, /Cari bisnis/);
    assert.match(script, /Jawa/);
    assert.match(script, /gianyar\.bali\.nusa\.business/);
    assert.match(script, /\/id\/babi-guling-pande-egi/);
    assert.match(script, /Food &amp; Drink/);
    assert.match(script, /Makanan|Warung/);
    assert.match(script, />Status<\/dt>/);
    assert.match(script, />Booking<\/dt>/);
    assert.match(script, />Host<\/dt>/);
    assert.match(script, /Alamat/);
    assert.match(script, /Nilai ulasan/);
    assert.match(script, />Sen<\//);
    assert.match(script, /sitemap\.xml/);
    assert.match(script, /\/host\/bali/);
    assert.match(script, /bali\.nusa\.business\/id/);
    assert.match(script, /robots\.txt/);
    assert.match(script, /Disallow: \/search/);
    assert.match(script, /Disallow: \/id\/search/);
  });
});
