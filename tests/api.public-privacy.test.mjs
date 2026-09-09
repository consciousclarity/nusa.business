import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

/**
 * C01 / H01 — public response privacy and publication gates.
 *
 * Synthetic store only. Asserts anonymous reads never leak bookings,
 * customer fields, review author email, or ownership internals; that owner A
 * cannot read owner B's bookings; and that drafts are unreachable publicly.
 */

const dataDir = mkdtempSync(join(tmpdir(), "nusa-c01-privacy-"));
process.env.NUSA_DATA_DIR = dataDir;
process.env.NUSA_AUTH_SECRET = "test-secret-at-least-16-chars-long";
process.env.NODE_ENV = "test";

const t = "2026-01-15T00:00:00.000Z";

const store = {
  islands: [
    {
      id: "isl-bali",
      slug: "bali",
      name: "Bali",
      tagline: "Island of the Gods",
      status: "active",
    },
  ],
  places: [
    {
      id: "pl-gianyar",
      islandId: "isl-bali",
      slug: "gianyar",
      name: "Gianyar",
      type: "kabupaten",
      summary: "Craft and cuisine hub.",
    },
  ],
  businesses: [
    {
      id: "biz-owner-a",
      placeId: "pl-gianyar",
      slug: "warung-owner-a",
      name: "Warung Owner A",
      status: "published",
      categories: ["Food & Drink"],
      summary: "Owner A listing",
      description: "Public description A",
      address: "Jl. A",
      phone: "+62 811 0000001",
      gallery: [],
      openingHours: [],
      faq: [],
      bookingMode: "service",
      ownerUserId: "usr-owner-a",
      registeredByAgentId: "usr-agent",
      vendorId: "vnd-a",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "biz-owner-b",
      placeId: "pl-gianyar",
      slug: "studio-owner-b",
      name: "Studio Owner B",
      status: "claimed",
      categories: ["Arts & Culture"],
      summary: "Owner B listing",
      description: "Public description B",
      gallery: [],
      openingHours: [],
      faq: [],
      bookingMode: "none",
      ownerUserId: "usr-owner-b",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "biz-draft",
      placeId: "pl-gianyar",
      slug: "secret-draft",
      name: "Secret Draft",
      status: "draft",
      categories: ["Food & Drink"],
      summary: "Should not be public",
      description: "Draft body",
      gallery: [],
      openingHours: [],
      faq: [],
      bookingMode: "service",
      ownerUserId: "usr-owner-a",
      createdAt: t,
      updatedAt: t,
    },
  ],
  users: [
    {
      id: "usr-admin",
      email: "admin@example.test",
      name: "Admin",
      role: "admin",
      password: "admin-pass",
    },
    {
      id: "usr-agent",
      email: "agent@example.test",
      name: "Agent",
      role: "field_agent",
      password: "agent-pass",
    },
    {
      id: "usr-owner-a",
      email: "owner-a@example.test",
      name: "Owner A",
      role: "owner",
      password: "owner-a-pass",
    },
    {
      id: "usr-owner-b",
      email: "owner-b@example.test",
      name: "Owner B",
      role: "owner",
      password: "owner-b-pass",
    },
    {
      id: "usr-vendor",
      email: "vendor@example.test",
      name: "Vendor",
      role: "vendor",
      password: "vendor-pass",
    },
  ],
  claims: [],
  reviews: [
    {
      id: "rev-private-email",
      businessId: "biz-owner-a",
      authorName: "Maya",
      authorEmail: "maya.private@example.test",
      service: 5,
      value: 5,
      location: 4,
      cleanliness: 4,
      comment: "Great warung.",
      createdAt: t,
    },
  ],
  bookings: [
    {
      id: "bk-owner-a",
      businessId: "biz-owner-a",
      mode: "service",
      customerName: "Customer A",
      customerEmail: "customer-a@example.test",
      customerPhone: "+62 812 1111111",
      startDate: "2026-02-01",
      timeSlot: "10:00",
      guests: 2,
      status: "pending",
      totalAmount: 150000,
      currency: "IDR",
      notes: "Private note for owner A",
      createdAt: t,
    },
    {
      id: "bk-owner-b",
      businessId: "biz-owner-b",
      mode: "service",
      customerName: "Customer B",
      customerEmail: "customer-b@example.test",
      startDate: "2026-02-02",
      status: "pending",
      totalAmount: 200000,
      currency: "IDR",
      notes: "Private note for owner B",
      createdAt: t,
    },
  ],
  vendors: [
    {
      id: "vnd-a",
      businessId: "biz-owner-a",
      name: "Warung A Shop",
      slug: "warung-a-shop",
      description: "Local products",
      commissionPercent: 0,
      createdAt: t,
      products: [
        {
          id: "prd-1",
          name: "Sambal",
          slug: "sambal",
          price: 25000,
          currency: "IDR",
          stock: 10,
          description: "Homemade sambal",
        },
      ],
    },
  ],
  invites: [],
  recoveryTokens: [],
  reports: [],
};

writeFileSync(join(dataDir, "store.json"), JSON.stringify(store, null, 2));

const { app } = await import("../apps/api/dist/app.js");
const { issueToken } = await import("../apps/api/dist/auth.js");

function authHeader(user) {
  return { Authorization: `Bearer ${issueToken(user)}` };
}

async function json(method, path, { headers, body } = {}) {
  const res = await app.request(path, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function assertNoPrivateBusinessFields(business, label) {
  assert.ok(business, label);
  for (const key of ["ownerUserId", "registeredByAgentId", "password"]) {
    assert.equal(
      Object.hasOwn(business, key),
      false,
      `${label} must omit ${key}`,
    );
  }
}

function assertNoPrivateReviewFields(review, label) {
  assert.ok(review, label);
  assert.equal(
    Object.hasOwn(review, "authorEmail"),
    false,
    `${label} must omit authorEmail`,
  );
}

describe("C01 public listing privacy", () => {
  it("anonymous listing detail omits bookings and private fields", async () => {
    const { status, data } = await json(
      "GET",
      "/v1/islands/bali/places/gianyar/businesses/warung-owner-a",
    );
    assert.equal(status, 200);
    assert.equal(Object.hasOwn(data, "bookings"), false);
    assertNoPrivateBusinessFields(data.business, "listing.business");
    assert.equal(data.business.name, "Warung Owner A");
    assert.equal(data.reviews.length, 1);
    assertNoPrivateReviewFields(data.reviews[0], "listing.review");
    assert.equal(data.reviews[0].authorName, "Maya");
    assert.ok(data.vendor);
    assert.equal(data.vendor.name, "Warung A Shop");
  });

  it("anonymous place hub and search omit ownership internals", async () => {
    const place = await json("GET", "/v1/islands/bali/places/gianyar");
    assert.equal(place.status, 200);
    assert.equal(place.data.businesses.length, 2);
    for (const b of place.data.businesses) {
      assertNoPrivateBusinessFields(b, `place.${b.slug}`);
      assert.notEqual(b.status, "draft");
    }

    const search = await json("GET", "/v1/search?q=Warung&island=bali");
    assert.equal(search.status, 200);
    assert.ok(search.data.results.length >= 1);
    for (const row of search.data.results) {
      assertNoPrivateBusinessFields(row.business, `search.${row.business.slug}`);
    }
  });

  it("anonymous field/recent omits agent ownership ids", async () => {
    const { status, data } = await json(
      "GET",
      "/v1/field/recent?island=bali&place=gianyar",
    );
    assert.equal(status, 200);
    assert.ok(data.businesses.length >= 1);
    for (const row of data.businesses) {
      assertNoPrivateBusinessFields(row.business, `recent.${row.business.slug}`);
    }
  });

  it("draft listings are not reachable on public routes", async () => {
    const detail = await json(
      "GET",
      "/v1/islands/bali/places/gianyar/businesses/secret-draft",
    );
    assert.equal(detail.status, 404);

    const place = await json("GET", "/v1/islands/bali/places/gianyar");
    assert.equal(
      place.data.businesses.some((b) => b.slug === "secret-draft"),
      false,
    );

    const review = await json("POST", "/v1/businesses/biz-draft/reviews", {
      body: {
        authorName: "X",
        authorEmail: "x@example.test",
        service: 3,
        value: 3,
        location: 3,
        cleanliness: 3,
        comment: "should fail",
      },
    });
    assert.equal(review.status, 404);

    const booking = await json("POST", "/v1/businesses/biz-draft/bookings", {
      body: {
        customerName: "X",
        customerEmail: "x@example.test",
        startDate: "2026-03-01",
      },
    });
    assert.equal(booking.status, 404);
  });

  it("review create response omits authorEmail", async () => {
    const { status, data } = await json(
      "POST",
      "/v1/businesses/biz-owner-a/reviews",
      {
        body: {
          authorName: "Sam",
          authorEmail: "sam.private@example.test",
          service: 4,
          value: 4,
          location: 4,
          cleanliness: 4,
          comment: "Nice",
        },
      },
    );
    assert.equal(status, 201);
    assertNoPrivateReviewFields(data.review, "created.review");
  });
});

describe("C01 booking authorization matrix", () => {
  it("owner A sees only their bookings with customer details", async () => {
    const { status, data } = await json("GET", "/v1/bookings", {
      headers: authHeader({ id: "usr-owner-a", role: "owner" }),
    });
    assert.equal(status, 200);
    assert.equal(data.bookings.length, 1);
    assert.equal(data.bookings[0].id, "bk-owner-a");
    assert.equal(data.bookings[0].customerEmail, "customer-a@example.test");
    assert.equal(data.bookings[0].notes, "Private note for owner A");
  });

  it("owner B cannot retrieve owner A bookings", async () => {
    const all = await json("GET", "/v1/bookings", {
      headers: authHeader({ id: "usr-owner-b", role: "owner" }),
    });
    assert.equal(all.status, 200);
    assert.equal(all.data.bookings.some((b) => b.id === "bk-owner-a"), false);
    assert.equal(all.data.bookings.length, 1);
    assert.equal(all.data.bookings[0].id, "bk-owner-b");

    const filtered = await json("GET", "/v1/bookings?businessId=biz-owner-a", {
      headers: authHeader({ id: "usr-owner-b", role: "owner" }),
    });
    assert.equal(filtered.status, 200);
    assert.equal(filtered.data.bookings.length, 0);
  });

  it("admin can list all bookings; agent and vendor cannot see A via ownership", async () => {
    const admin = await json("GET", "/v1/bookings", {
      headers: authHeader({ id: "usr-admin", role: "admin" }),
    });
    assert.equal(admin.status, 200);
    assert.equal(admin.data.bookings.length, 2);

    const agent = await json("GET", "/v1/bookings", {
      headers: authHeader({ id: "usr-agent", role: "field_agent" }),
    });
    assert.equal(agent.status, 200);
    assert.equal(agent.data.bookings.length, 0);

    const vendor = await json("GET", "/v1/bookings", {
      headers: authHeader({ id: "usr-vendor", role: "vendor" }),
    });
    assert.equal(vendor.status, 200);
    assert.equal(vendor.data.bookings.length, 0);
  });

  it("unauthenticated bookings inbox is rejected", async () => {
    const { status } = await json("GET", "/v1/bookings");
    assert.equal(status, 401);
  });

  it("portal listings still expose ownership fields to the owner", async () => {
    const { status, data } = await json("GET", "/v1/portal/listings", {
      headers: authHeader({ id: "usr-owner-a", role: "owner" }),
    });
    assert.equal(status, 200);
    const mine = data.businesses.find((row) => row.business.id === "biz-owner-a");
    assert.ok(mine);
    assert.equal(mine.business.ownerUserId, "usr-owner-a");
    assert.equal(mine.business.registeredByAgentId, "usr-agent");
  });

  it("hides GET /v1/host in production", async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const { status, data } = await json("GET", "/v1/host");
      assert.equal(status, 404);
      assert.equal(data.error, "Not found");
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
