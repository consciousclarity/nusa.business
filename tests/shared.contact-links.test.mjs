import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contactDigits, telHref, whatsappHref } from "@nusa/shared";

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
});
