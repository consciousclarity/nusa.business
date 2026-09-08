import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alternateLocale,
  detectLocale,
  withLocale,
} from "@nusa/shared";

describe("i18n locale paths", () => {
  it("detects /id prefix and strips it", () => {
    assert.deepEqual(detectLocale("/id"), {
      locale: "id",
      pathWithoutLocale: "/",
    });
    assert.deepEqual(detectLocale("/id/claim"), {
      locale: "id",
      pathWithoutLocale: "/claim",
    });
    assert.deepEqual(detectLocale("/id/host/gianyar.bali"), {
      locale: "id",
      pathWithoutLocale: "/host/gianyar.bali",
    });
    assert.deepEqual(detectLocale("/host/bali"), {
      locale: "en",
      pathWithoutLocale: "/host/bali",
    });
  });

  it("prefixes Indonesian paths", () => {
    assert.equal(withLocale("/", "id"), "/id");
    assert.equal(withLocale("/claim", "id"), "/id/claim");
    assert.equal(withLocale("/host/bali", "en"), "/host/bali");
    assert.equal(alternateLocale("en"), "id");
  });
});
