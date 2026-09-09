import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contactDigits,
  mapsHref,
  telHref,
  websiteHref,
  whatsappHref,
} from "@nusa/shared";

describe("contactDigits / WhatsApp / tel hrefs", () => {
  it("normalises Indonesian local numbers for wa.me", () => {
    assert.equal(contactDigits("+62 812 0000001"), "628120000001");
    assert.equal(contactDigits("0812-0000-001"), "628120000001");
    assert.equal(
      whatsappHref("0812 0000 001"),
      "https://wa.me/628120000001",
    );
    assert.equal(telHref("+62 812 0000001"), "tel:+628120000001");
  });

  it("rejects empty or too-short values", () => {
    assert.equal(whatsappHref(""), null);
    assert.equal(whatsappHref("123"), null);
    assert.equal(telHref("abc"), null);
  });

  it("builds Directions and http(s)-only website hrefs", () => {
    assert.equal(
      mapsHref({ lat: -8.5, lng: 115.3 }),
      "https://www.google.com/maps/dir/?api=1&destination=-8.5,115.3",
    );
    assert.equal(
      mapsHref({ address: "Ubud, Bali" }),
      "https://www.google.com/maps/search/?api=1&query=Ubud%2C%20Bali",
    );
    assert.equal(websiteHref("https://example.com/x"), "https://example.com/x");
    assert.equal(websiteHref("javascript:alert(1)"), null);
    assert.equal(websiteHref("ftp://example.com"), null);
  });
});
