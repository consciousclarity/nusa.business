import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const dataDir = mkdtempSync(join(tmpdir(), "nusa-c06-"));
process.env.NUSA_DATA_DIR = dataDir;
process.env.NUSA_AUTH_SECRET = "test-secret-at-least-16-chars-long";
process.env.NODE_ENV = "test";
process.env.NUSA_RATELIMIT_DISABLED = "1";
process.env.NUSA_CORS_ORIGINS = "https://staging.example.test";

const t = "2026-01-15T00:00:00.000Z";
writeFileSync(
  join(dataDir, "store.json"),
  JSON.stringify({
    islands: [
      {
        id: "isl-bali",
        slug: "bali",
        name: "Bali",
        tagline: "x",
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
        summary: "x",
      },
    ],
    businesses: [
      {
        id: "biz-owned",
        placeId: "pl-gianyar",
        slug: "owned-warung",
        name: "Owned Warung",
        status: "published",
        categories: ["Food & Drink"],
        summary: "s",
        description: "d",
        gallery: [],
        openingHours: [],
        faq: [],
        bookingMode: "service",
        ownerUserId: "usr-owner",
        createdAt: t,
        updatedAt: t,
      },
      {
        id: "biz-other",
        placeId: "pl-gianyar",
        slug: "other-warung",
        name: "Other Warung",
        status: "published",
        categories: ["Food & Drink"],
        summary: "s",
        description: "d",
        gallery: [],
        openingHours: [],
        faq: [],
        bookingMode: "service",
        ownerUserId: "usr-other",
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
        password: "admin-pass-long",
      },
      {
        id: "usr-owner",
        email: "owner@example.test",
        name: "Owner",
        role: "owner",
        password: "owner-pass-long",
      },
      {
        id: "usr-other",
        email: "other@example.test",
        name: "Other",
        role: "owner",
        password: "other-pass-long",
      },
      {
        id: "usr-agent",
        email: "agent@example.test",
        name: "Agent",
        role: "field_agent",
        password: "agent-pass-long",
      },
    ],
    claims: [],
    reviews: [],
    bookings: [
      {
        id: "bk-other",
        businessId: "biz-other",
        mode: "service",
        customerName: "Guest",
        customerEmail: "guest@example.test",
        startDate: "2026-02-01",
        status: "pending",
        totalAmount: 0,
        currency: "IDR",
        createdAt: t,
      },
    ],
    vendors: [],
    invites: [],
    recoveryTokens: [],
    reports: [],
  }),
);

const { app } = await import("../apps/api/dist/app.js");
const { hashStoredPasswords } = await import("../packages/db/dist/repository.js");
await hashStoredPasswords();

async function login(email, password) {
  const res = await app.request("/v1/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200, email);
  return (await res.json()).token;
}

describe("C06 CORS allowlist", () => {
  it("reflects allowed origins and omits ACAO for strangers", async () => {
    const allowed = await app.request("/health", {
      headers: { Origin: "http://localhost:4321" },
    });
    assert.equal(allowed.status, 200);
    assert.equal(
      allowed.headers.get("access-control-allow-origin"),
      "http://localhost:4321",
    );

    const nested = await app.request("/health", {
      headers: { Origin: "https://gianyar.bali.nusa.business" },
    });
    assert.equal(
      nested.headers.get("access-control-allow-origin"),
      "https://gianyar.bali.nusa.business",
    );

    const extra = await app.request("/health", {
      headers: { Origin: "https://staging.example.test" },
    });
    assert.equal(
      extra.headers.get("access-control-allow-origin"),
      "https://staging.example.test",
    );

    const denied = await app.request("/health", {
      headers: { Origin: "https://evil.example" },
    });
    assert.equal(denied.status, 200);
    assert.equal(denied.headers.get("access-control-allow-origin"), null);
  });
});

describe("C06 authorization matrix", () => {
  it("scopes listings, bookings, claims, and admin routes by role", async () => {
    const ownerTok = await login("owner@example.test", "owner-pass-long");
    const otherTok = await login("other@example.test", "other-pass-long");
    const agentTok = await login("agent@example.test", "agent-pass-long");
    const adminTok = await login("admin@example.test", "admin-pass-long");

    const ownerListings = await app.request("/v1/portal/listings", {
      headers: { Authorization: `Bearer ${ownerTok}` },
    });
    assert.equal(ownerListings.status, 200);
    const ownedIds = (await ownerListings.json()).businesses.map(
      (row) => row.business.id,
    );
    assert.deepEqual(ownedIds, ["biz-owned"]);

    const patchOther = await app.request("/v1/portal/listings/biz-other", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${ownerTok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ summary: "hijack" }),
    });
    assert.equal(patchOther.status, 403);

    const bookings = await app.request("/v1/bookings", {
      headers: { Authorization: `Bearer ${ownerTok}` },
    });
    assert.equal(bookings.status, 200);
    assert.equal((await bookings.json()).bookings.length, 0);

    const otherBookings = await app.request("/v1/bookings", {
      headers: { Authorization: `Bearer ${otherTok}` },
    });
    assert.equal((await otherBookings.json()).bookings.length, 1);

    const agentPatch = await app.request("/v1/portal/listings/biz-owned", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${agentTok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ summary: "agent hijack" }),
    });
    assert.equal(agentPatch.status, 403);

    const invite = await app.request("/v1/invites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerTok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "nope@example.test" }),
    });
    assert.equal(invite.status, 403);

    const agentInvite = await app.request("/v1/invites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${agentTok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "nope2@example.test" }),
    });
    assert.equal(agentInvite.status, 403);

    const adminInvite = await app.request("/v1/invites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminTok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "ok@example.test" }),
    });
    assert.equal(adminInvite.status, 201);

    const claim = await app.request("/v1/claims", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerTok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        businessId: "biz-other",
        note: "I think this is mine",
      }),
    });
    assert.equal(claim.status, 201);
    const claimId = (await claim.json()).claim.id;

    const ownerDecide = await app.request(`/v1/claims/${claimId}/decide`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerTok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ status: "approved" }),
    });
    assert.equal(ownerDecide.status, 403);

    const adminDecide = await app.request(`/v1/claims/${claimId}/decide`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminTok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ status: "rejected", reason: "Not the owner" }),
    });
    assert.equal(adminDecide.status, 200);
  });
});
