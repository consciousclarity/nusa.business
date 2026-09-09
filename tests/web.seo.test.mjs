import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  escapeXml,
  hostPath,
  localBusinessJsonLd,
  localeSitemapPaths,
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
      hostPath({
        island: "bali",
        place: "gianyar",
        area: "ubud",
        category: "warungs-local-food",
        facet: "cuisine",
        facetValue: "balinese",
      }),
      "/host/gianyar.bali/ubud/c/warungs-local-food/cuisine/balinese",
    );
    assert.equal(
      hostPath({ island: "bali", category: "pharmacies", facet: "availability", facetValue: "24-hours" }),
      "/host/bali/c/pharmacies/availability/24-hours",
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
    assert.equal(biz.inLanguage, "en");
    assert.deepEqual(biz.additionalType, ["Food & Drink"]);
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
    assert.equal(
      websiteJsonLd({ url: "http://localhost:4321/id", locale: "id" }).inLanguage,
      "id",
    );
  });

  it("localBusinessJsonLd additionalType follows locale", () => {
    const node = localBusinessJsonLd({
      name: "Warung Example",
      description: "Babi guling",
      url: "https://gianyar.bali.nusa.business/foo",
      categories: ["food-drink", "warungs-local-food"],
      locale: "id",
    });
    assert.equal(node.inLanguage, "id");
    assert.deepEqual(node.additionalType, [
      "Makanan & minuman",
      "Warung & makanan lokal",
    ]);
  });

  it("localBusinessJsonLd emits openingHoursSpecification", () => {
    const node = localBusinessJsonLd({
      name: "Clinic",
      description: "24h",
      url: "https://example.test/clinic",
      openingHours: [
        { day: "Mon", open: "00:00", close: "24:00" },
        { day: "Sun", open: "09:00", close: "17:00", closed: true },
      ],
    });
    assert.deepEqual(node.openingHoursSpecification, [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Monday",
        opens: "00:00",
        closes: "23:59",
      },
    ]);
  });

  it("localeSitemapPaths adds /id counterparts once", () => {
    assert.deepEqual(localeSitemapPaths("/"), ["/", "/id"]);
    assert.deepEqual(localeSitemapPaths("/host/bali"), [
      "/host/bali",
      "/id/host/bali",
    ]);
    assert.deepEqual(localeSitemapPaths("/id/host/bali"), ["/id/host/bali"]);
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
