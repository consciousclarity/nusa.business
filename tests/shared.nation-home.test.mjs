import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nationHomeHref } from "@nusa/shared";

/**
 * Brand + breadcrumb "nusa.business" must always leave a tenant host and land
 * on the nation apex — never stay on java.nusa.business / jakarta.java… via /.
 */
describe("nationHomeHref", () => {
  it("always sends brand clicks to the apex on real nusa.business hosts", () => {
    for (const host of [
      "nusa.business",
      "java.nusa.business",
      "jakarta.java.nusa.business",
      "gianyar.bali.nusa.business",
    ]) {
      assert.equal(
        nationHomeHref(host),
        "https://nusa.business/",
        `expected apex for Host: ${host}`,
      );
    }
  });

  it("keeps a same-origin / on local/dev hosts", () => {
    for (const host of ["localhost:4321", "127.0.0.1:4321", "bali.localhost"]) {
      assert.equal(nationHomeHref(host), "/", `expected / for Host: ${host}`);
    }
  });

  it("strips ports and is case-insensitive", () => {
    assert.equal(
      nationHomeHref("Jakarta.Java.Nusa.Business:443"),
      "https://nusa.business/",
    );
  });
});
