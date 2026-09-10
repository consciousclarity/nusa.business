import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const record = readFileSync(
  new URL("../apps/web/src/components/ListingRecord.astro", import.meta.url),
  "utf8",
);

describe("listing record emphasis", () => {
  it("groups name, category, location, and status in an identity block", () => {
    assert.match(record, /class="listing-identity"/);
    const identity = record.slice(
      record.indexOf("listing-identity"),
      record.indexOf("listing-copy") > 0
        ? record.indexOf("</header>")
        : record.length,
    );
    assert.match(identity, /<h1>\{business\.name\}<\/h1>/);
    assert.match(record, /categoryLine/);
    assert.match(record, /locationLine/);
    assert.match(record, /listing-quiet/);
  });

  it("keeps unclaimed status as quiet meta, not a stamp", () => {
    assert.match(record, /listedUnclaimed/);
    assert.match(record, /listing-quiet/);
    const quietBlock = record.slice(
      record.indexOf("let quietStatus"),
      record.indexOf("const hoursLabel"),
    );
    assert.match(quietBlock, /listedUnclaimed/);
    assert.doesNotMatch(quietBlock, /stamp = t\(locale, "listedUnclaimed"\)/);
  });

  it("puts WhatsApp ahead of Call and Directions as the primary action", () => {
    const wa = record.indexOf("whatsappHref(business.whatsapp)");
    const call = record.indexOf("telHref(business.phone)");
    const dir = record.indexOf("mapsHref({");
    assert.ok(wa >= 0 && call > wa && dir > call);
    assert.match(record, /primary: contactActions\.length === 0/);
    assert.match(record, /listing-action-bar/);
    assert.match(record, /position:\s*fixed/);
    assert.match(record, /safe-area-inset-bottom/);
  });

  it("renders the gallery beside the summary on wide viewports", () => {
    assert.match(record, /listing-gallery/);
    assert.match(record, /grid-template-areas:\s*"gallery copy"/);
    assert.match(record, /loading=\{i === 0 \? "eager" : "lazy"\}/);
  });

  it("keeps opening hours as a table with a live Open now label", () => {
    assert.match(record, /<table class="data">/);
    assert.match(record, /hours-caption/);
    assert.match(record, /t\(locale, "openNow"\)/);
    assert.match(record, /t\(locale, "closedNow"\)/);
    assert.match(record, /listingHoursStatus/);
    assert.match(record, /weekdayLabel\(locale, h\.day\)/);
  });

  it("renders reviews as cards and keeps the add-review form", () => {
    assert.match(record, /review-card/);
    assert.doesNotMatch(record, /reviewScores<\/caption>/);
    assert.match(record, /id="review-form"/);
    assert.match(record, /t\(locale, "addReview"\)/);
  });
});
