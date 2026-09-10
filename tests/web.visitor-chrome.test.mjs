import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const home = readFileSync(
  new URL("../apps/web/src/pages/index.astro", import.meta.url),
  "utf8",
);
const listingPage = readFileSync(
  new URL("../apps/web/src/pages/host/[label]/[...path].astro", import.meta.url),
  "utf8",
);
const listingRecord = readFileSync(
  new URL("../apps/web/src/components/ListingRecord.astro", import.meta.url),
  "utf8",
);
const listing = listingPage + listingRecord;
const place = readFileSync(
  new URL("../apps/web/src/components/PlaceDirectory.astro", import.meta.url),
  "utf8",
);
const island = readFileSync(
  new URL("../apps/web/src/pages/host/[label]/index.astro", import.meta.url),
  "utf8",
);
const claim = readFileSync(
  new URL("../apps/web/src/pages/claim.astro", import.meta.url),
  "utf8",
);
const base = readFileSync(
  new URL("../apps/web/src/layouts/Base.astro", import.meta.url),
  "utf8",
);
const search = readFileSync(
  new URL("../apps/web/src/pages/search.astro", import.meta.url),
  "utf8",
);
const support = readFileSync(
  new URL("../apps/web/src/pages/support.astro", import.meta.url),
  "utf8",
);
const browse = readFileSync(
  new URL("../apps/web/src/components/CategoryBrowse.astro", import.meta.url),
  "utf8",
);
const notFound = readFileSync(
  new URL("../apps/web/src/pages/404.astro", import.meta.url),
  "utf8",
);
const serverError = readFileSync(
  new URL("../apps/web/src/pages/500.astro", import.meta.url),
  "utf8",
);
const apiHelper = readFileSync(
  new URL("../apps/web/src/lib/api.ts", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../apps/web/src/styles/global.css", import.meta.url),
  "utf8",
);
const grids = readFileSync(
  new URL("../apps/web/src/components/LayoutGrids.astro", import.meta.url),
  "utf8",
);

describe("visitor chrome (no debug resolver)", () => {
  it("homepage is search-first and omits host-resolver jargon", () => {
    assert.match(home, /name="q"/);
    assert.match(home, /name="category"/);
    assert.match(home, /action=\{searchAction\}/);
    assert.match(home, /categoryLabel\(group.slug, locale\)/);
    assert.doesNotMatch(home, /kind=nation/);
    assert.doesNotMatch(home, /class="resolver"/);
    assert.match(home, /tenantHref\(/);
    assert.doesNotMatch(home, /publicUrl\(/);
    assert.match(home, /islandTagline\(locale, island.slug, island.tagline\)/);
    assert.match(home, /islandName\(locale, island.slug, island.name\)/);
    assert.match(home, /apiTry</);
    assert.match(home, /directoryUnavailable/);
    assert.match(apiHelper, /export async function apiTry/);
    assert.match(apiHelper, /AbortSignal\.timeout/);
  });

  it("uses a 1120px page measure with hero, index, and record grids", () => {
    assert.match(css, /70rem/);
    assert.doesNotMatch(css, /78ch/);
    assert.match(base, /LayoutGrids/);
    assert.match(grids, /\.hero-split/);
    assert.match(grids, /\.index-grid/);
    assert.match(grids, /repeat\(3,/);
    assert.match(grids, /\.record-layout/);
    assert.match(home, /hero-split/);
    assert.match(home, /index-grid/);
    assert.match(island, /index-grid/);
    assert.match(place, /index-grid/);
    assert.match(browse, /index-grid/);
    assert.match(search, /index-grid/);
    assert.match(listing, /record-layout/);
    assert.match(listing, /record-aside/);
    assert.match(listing, /record-main/);
    assert.match(listing, /listingActions/);
  });

  it("listing chrome uses i18n keys for reviews, booking, shop, and address", () => {
    assert.match(listing, /t\(locale, "addressLabel"\)/);
    assert.match(listing, /t\(locale, "addReview"\)/);
    assert.match(listing, /t\(locale, "bookingTitle"\)/);
    assert.match(listing, /t\(locale, "shopNote"\)/);
    assert.match(listing, /listingCopy/);
    assert.doesNotMatch(listing, /<h3>Add review<\/h3>/);
    assert.doesNotMatch(listing, /<h2>Request a booking<\/h2>/);
    assert.doesNotMatch(listing, /Vendor store · 0% commission/);
    assert.doesNotMatch(listing, /data\.booking\.id/);
    assert.match(listing, /weekdayLabel\(locale, h\.day\)/);
    assert.match(listing, /islandName\(locale,/);
    assert.match(listing, /tenantAbsHref\(/);
    assert.match(listing, /nationAbsHref\(/);
    assert.match(listing, /const listingUrl = tenantAbsHref/);
    assert.match(listing, /categoryLabel\(cat, locale\)/);
    assert.match(listing, /localBusinessJsonLd\(\{[\s\S]*locale,/);
    assert.match(listing, /visitorError\(/);
    assert.doesNotMatch(listing, /data\?\.error\) detail = data\.error/);
    assert.doesNotMatch(listing, /data\.notice \|\|/);
    assert.match(listing, /Astro\.rewrite\(withLocale\("\/404", locale\)\)/);
  });

  it("listing actions put contact first and claim second", () => {
    assert.match(listing, /t\(locale, "directions"\)/);
    assert.match(listing, /t\(locale, "claimThis"\)/);
    assert.doesNotMatch(listing, /<dt>Host<\/dt>/);
    assert.doesNotMatch(listing, /<dt>Booking<\/dt>/);
    assert.doesNotMatch(listing, /<dt>Status<\/dt>/);
    const claimIdx = listing.indexOf('t(locale, "claimThis")');
    const directionsIdx = listing.indexOf('t(locale, "directions")');
    assert.ok(directionsIdx >= 0 && claimIdx > directionsIdx);
  });

  it("place hubs surface field-registered listings without agent ids", () => {
    assert.match(place, /b\.fieldRegistered/);
    assert.doesNotMatch(place, /registeredByAgentId/);
  });

  it("place and island hubs no longer expose resolver panels", () => {
    assert.doesNotMatch(place, /class="resolver"/);
    assert.doesNotMatch(island, /class="resolver"/);
    assert.doesNotMatch(claim, /class="resolver"/);
    assert.doesNotMatch(place, / published/);
    assert.doesNotMatch(island, /replaceAll\("_"/);
    assert.doesNotMatch(place, /replaceAll\("_"/);
  });

  it("hreflang and og:locale advertise en/id plus x-default", () => {
    assert.match(base, /hreflang="x-default"/);
    assert.match(base, /property="og:locale"/);
    assert.match(base, /og:locale:alternate/);
  });

  it("header leads with Search; Claim is secondary; Portal stays in the footer", () => {
    const header = base.slice(base.indexOf("<header"), base.indexOf("</header>"));
    assert.match(header, /nav-search/);
    assert.match(header, /withLocale\("\/search"/);
    const searchIdx = header.indexOf('withLocale("/search"');
    const claimIdx = header.indexOf('withLocale("/claim"');
    assert.ok(searchIdx >= 0 && claimIdx > searchIdx);
    assert.match(header, /nav-owner/);
    assert.doesNotMatch(header, /portalUrl/);
    assert.match(base, /href=\{portalUrl\}/);
  });

  it("support describes free owner signup, not invite-only", () => {
    assert.match(support, /t\(locale, "supportOwner"\)/);
    assert.doesNotMatch(support, /invite-only/);
    assert.match(support, /\/register/);
  });

  it("footer points at privacy, terms, and support instead of /host paths", () => {
    assert.match(base, /\/privacy/);
    assert.match(base, /\/terms/);
    assert.match(base, /\/support/);
    assert.doesNotMatch(base, /\/host\/gianyar\.bali/);
  });

  it("public category chrome passes locale into taxonomy labels", () => {
    assert.match(place, /categoryFilterOptions\(/);
    assert.match(place, /categoryLabel\(activeCategory, locale\)/);
    assert.match(place, /categoryLabel\(b\.categories\[0\] \?\? "", locale\)/);
    assert.match(browse, /categoryLabel\(browse\.category, locale\)/);
    assert.match(browse, /inWhere\(locale, facetHeading, where\)/);
    assert.match(island, /islandTagline\(locale, islandData.island.slug/);
    assert.match(island, /islandName\(locale, islandData.island.slug/);
    assert.match(island, /tenantAbsHref\(/);
    assert.match(browse, /unavailable/);
    assert.match(browse, /directoryUnavailable/);
    assert.match(search, /categoryLabel\(group\.slug, locale\)/);
  });

  it("search results are shareable query URLs and noindex", () => {
    assert.match(search, /name="q"/);
    assert.match(search, /name="island"/);
    assert.match(search, /name="category"/);
    assert.match(search, /robots="noindex,follow"/);
    assert.match(search, /islandName\(locale/);
  });

  it("breadcrumbs use human names, not URL slugs", () => {
    assert.match(island, /islandName\(locale, islandData.island.slug/);
    assert.doesNotMatch(island, /label: islandData.island.slug/);
    assert.match(listing, /label: data.business.name/);
    assert.doesNotMatch(listing, /label: data.business.slug/);
    assert.doesNotMatch(listing, /label: islandSlug!/);
    assert.doesNotMatch(base, /crumb.length > 0 && <span class="sep"/);
  });

  it("missing routes render a localized 404 with search, not a blank body", () => {
    assert.match(notFound, /t\(locale, "notFoundH1"\)/);
    assert.match(notFound, /robots="noindex,follow"/);
    assert.match(notFound, /withLocale\("\/search", locale\)/);
    assert.match(listing, /Astro\.rewrite\(withLocale\("\/404", locale\)\)/);
    assert.doesNotMatch(listing, /new Response\(null, \{ status: 404 \}/);
    assert.match(island, /apiOrNull/);
    assert.match(island, /Astro\.rewrite\(withLocale\("\/404", locale\)\)/);
  });

  it("search and homepage stay up when the directory API fails", () => {
    assert.match(search, /apiTry</);
    assert.match(search, /searchFailed/);
    assert.match(search, /islands === null/);
    assert.match(search, /directoryUnavailable/);
    assert.doesNotMatch(search, /await api</);
  });

  it("SSR errors render a localized 500 with search, not a blank body", () => {
    assert.match(serverError, /t\(locale, "serverErrorH1"\)/);
    assert.match(serverError, /robots="noindex,follow"/);
    assert.match(serverError, /withLocale\("\/search", locale\)/);
    assert.match(serverError, /Astro\.response\.status = 500/);
    assert.match(serverError, /detectLocale\(Astro\.url\.pathname\)/);
    assert.doesNotMatch(serverError, /from "\.\.\/lib\/api"/);
  });
});
