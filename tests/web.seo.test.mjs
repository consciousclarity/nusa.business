import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  escapeXml,
  hostPath,
  localBusinessJsonLd,
  siteOrigin,
  sitemapXml,
  websiteJsonLd,
  withLocale,
} from "@nusa/shared";

function req(host, proto) {
  const headers = new Headers({ host });
  if (proto) headers.set("x-forwarded-proto", proto);
  return new Request("http://example.test/", { headers });
}

describe("public SEO helpers (C11)", () => {
  it("derives site origin from host and forwarded proto", () => {
    assert.equal(siteOrigin(req("localhost:4321")), "http://localhost:4321");
    assert.equal(
      siteOrigin(req("nusa.business", "https")),
      "https://nusa.business",
    );
  });

  it("builds absolute URLs and /host paths", () => {
    const r = req("localhost:4321");
    assert.equal(absoluteUrl(r, "/claim"), "http://localhost:4321/claim");
    assert.equal(
      hostPath({ island: "bali", place: "gianyar", slug: "babi-guling" }),
      "/host/gianyar.bali/babi-guling",
    );
    assert.equal(
      absoluteUrl(r, withLocale(hostPath({ island: "bali" }), "id")),
      "http://localhost:4321/id/host/bali",
    );
  });

  it("emits LocalBusiness + BreadcrumbList JSON-LD", () => {
    const biz = localBusinessJsonLd({
      name: "Test Warung",
      description: "Nasi goreng",
      url: "http://localhost:4321/host/gianyar.bali/test",
      address: "Gianyar",
      telephone: "+62 812",
      categories: ["Food & Drink"],
    });
    assert.equal(biz["@type"], "LocalBusiness");
    assert.equal(biz.name, "Test Warung");
    const crumbs = breadcrumbJsonLd([
      { name: "nusa.business", url: "http://localhost:4321/" },
      {
        name: "Test Warung",
        url: "http://localhost:4321/host/gianyar.bali/test",
      },
    ]);
    assert.equal(crumbs["@type"], "BreadcrumbList");
    assert.equal(crumbs.itemListElement.length, 2);
    assert.equal(
      websiteJsonLd({ url: "http://localhost:4321/" })["@type"],
      "WebSite",
    );
  });

  it("escapes sitemap XML and lists locs", () => {
    assert.equal(escapeXml(`a&b<"c"`), "a&amp;b&lt;&quot;c&quot;");
    const xml = sitemapXml([
      "http://localhost:4321/",
      "http://localhost:4321/host/bali",
    ]);
    assert.match(
      xml,
      /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/,
    );
    assert.match(xml, /<loc>http:\/\/localhost:4321\/host\/bali<\/loc>/);
  });
});
