import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NUSA_AUTH_SECRET = "test-secret-at-least-16-chars-long";

const {
  assertBookingRequest,
  parseBookingBody,
  parseListingPatchBody,
  parseRegisterBody,
  parseReportBody,
  parseReviewBody,
} = await import("../apps/api/dist/validate.js");

describe("parseReviewBody", () => {
  const good = {
    authorName: "Maya",
    comment: "Great",
    service: 5,
    value: 4,
    location: 3,
    cleanliness: 5,
  };

  it("accepts a valid review", () => {
    const r = parseReviewBody(good);
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.value.authorName, "Maya");
  });

  it("rejects out-of-range scores and non-integers", () => {
    assert.equal(parseReviewBody({ ...good, service: 0 }).ok, false);
    assert.equal(parseReviewBody({ ...good, value: 6 }).ok, false);
    assert.equal(parseReviewBody({ ...good, location: 3.5 }).ok, false);
    assert.equal(parseReviewBody({ ...good, cleanliness: NaN }).ok, false);
  });

  it("rejects oversized comment and missing name", () => {
    assert.equal(parseReviewBody({ ...good, authorName: "" }).ok, false);
    assert.equal(
      parseReviewBody({ ...good, comment: "x".repeat(5000) }).ok,
      false,
    );
  });
});

describe("parseBookingBody", () => {
  const good = {
    customerName: "Sam",
    customerEmail: "sam@example.test",
    startDate: "2026-05-01",
  };

  it("accepts a valid request and ignores totalAmount", () => {
    const r = parseBookingBody({ ...good, totalAmount: 999999 });
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.value.customerEmail, "sam@example.test");
      assert.equal("totalAmount" in r.value, false);
    }
  });

  it("rejects bad email, dates, and non-finite quantities", () => {
    assert.equal(parseBookingBody({ ...good, customerEmail: "nope" }).ok, false);
    assert.equal(parseBookingBody({ ...good, startDate: "05/01/2026" }).ok, false);
    assert.equal(
      parseBookingBody({ ...good, endDate: "2026-04-01" }).ok,
      false,
    );
    assert.equal(parseBookingBody({ ...good, tickets: Infinity }).ok, false);
    assert.equal(parseBookingBody({ ...good, guests: 0 }).ok, false);
  });
});

describe("parseListingPatchBody", () => {
  it("allowlists fields and rejects ownership injection", () => {
    assert.equal(
      parseListingPatchBody({ ownerUserId: "usr-evil", name: "Ok" }).ok,
      false,
    );
    assert.equal(
      parseListingPatchBody({ registeredByAgentId: "usr-agent" }).ok,
      false,
    );
    const ok = parseListingPatchBody({
      name: "Warung",
      website: "https://example.test",
      bookingMode: "service",
    });
    assert.equal(ok.ok, true);
  });

  it("rejects unsafe website protocols and unknown categories", () => {
    assert.equal(
      parseListingPatchBody({ website: "javascript:alert(1)" }).ok,
      false,
    );
    assert.equal(
      parseListingPatchBody({ categories: ["Not A Real Category"] }).ok,
      false,
    );
    const mapped = parseListingPatchBody({ categories: ["Food & Drink"] });
    assert.equal(mapped.ok, true);
    if (mapped.ok) assert.deepEqual(mapped.value.categories, ["food-drink"]);
    const facets = parseListingPatchBody({
      facets: { cuisine: ["Balinese"], dietary: ["halal"] },
    });
    assert.equal(facets.ok, true);
    if (facets.ok) {
      assert.deepEqual(facets.value.facets, {
        cuisine: ["balinese"],
        dietary: ["halal"],
      });
    }
    assert.equal(
      parseListingPatchBody({ facets: { nope: ["x"] } }).ok,
      false,
    );
  });
});

describe("calendar dates", () => {
  const good = { customerName: "Sam", customerEmail: "sam@example.test" };
  for (const date of ["2026-02-29", "2026-02-30", "2026-04-31", "1900-02-29", "2100-02-29", "2026-00-01", "2026-13-01", "2026-01-00"]) {
    it(`rejects ${date} as either booking date`, () => {
      assert.equal(parseBookingBody({ ...good, startDate: date }).ok, false);
      assert.equal(parseBookingBody({ ...good, startDate: "0001-01-01", endDate: date }).ok, false);
    });
  }
  for (const date of ["2026-02-28", "2024-02-29", "2000-02-29", "2026-04-30", "2026-12-31", "0001-01-01"]) {
    it(`preserves valid boundary ${date}`, () => {
      const parsed = parseBookingBody({ ...good, startDate: date, endDate: date });
      assert.equal(parsed.ok, true);
      assert.equal(parsed.value.startDate, date);
      assert.equal(parsed.value.endDate, date);
    });
  }
});

it("rejects owner status patches while allowing ordinary edits", () => {
  for (const status of ["claimed", "draft", "published", null]) {
    assert.equal(parseListingPatchBody({ name: "Allowed", status }).ok, false);
  }
  assert.equal(parseListingPatchBody({ name: "Allowed", slug: "new-slug" }).ok, true);
});

describe("assertBookingRequest", () => {
  const good = {
    customerName: "Sam",
    customerEmail: "sam@example.test",
    startDate: "2027-05-01",
  };

  it("rejects past dates and booking-disabled listings", () => {
    assert.equal(
      assertBookingRequest("service", good, { today: "2027-05-02" }).ok,
      false,
    );
    assert.equal(assertBookingRequest("none", good, { today: "2027-05-01" }).ok, false);
  });

  it("requires rental endDate and event tickets", () => {
    assert.equal(
      assertBookingRequest("rental", good, { today: "2027-05-01" }).ok,
      false,
    );
    assert.equal(
      assertBookingRequest(
        "rental",
        { ...good, endDate: "2027-05-03" },
        { today: "2027-05-01" },
      ).ok,
      true,
    );
    assert.equal(
      assertBookingRequest("event", good, { today: "2027-05-01" }).ok,
      false,
    );
    assert.equal(
      assertBookingRequest("event", { ...good, tickets: 2 }, { today: "2027-05-01" }).ok,
      true,
    );
  });
});

describe("parseRegisterBody", () => {
  it("accepts owner self-signup and rejects client-chosen roles", () => {
    const ok = parseRegisterBody({
      email: "new@example.test",
      name: "Maya",
      password: "owner-password-12",
      returnTo: "/claim?businessId=biz-a",
    });
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.value.kind, "owner");
      if (ok.value.kind === "owner") {
        assert.equal(ok.value.email, "new@example.test");
      }
    }
    assert.equal(
      parseRegisterBody({
        email: "new@example.test",
        name: "Maya",
        password: "owner-password-12",
        role: "admin",
      }).ok,
      false,
    );
    assert.equal(
      parseRegisterBody({
        email: "new@example.test",
        name: "Maya",
        password: "short",
      }).ok,
      false,
    );
  });

  it("accepts invite redeem without an email field", () => {
    const ok = parseRegisterBody({
      token: "a".repeat(32),
      name: "Maya",
      password: "owner-password-12",
    });
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.value.kind, "invite");
  });
});

describe("parseReportBody", () => {
  it("accepts correction notes and rejects short or unknown kinds", () => {
    assert.equal(
      parseReportBody({ kind: "correction", note: "Hours are wrong on Sunday." }).ok,
      true,
    );
    assert.equal(parseReportBody({ kind: "spam", note: "Hours are wrong on Sunday." }).ok, false);
    assert.equal(parseReportBody({ kind: "abuse", note: "too short" }).ok, false);
  });
});
