import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { safePortalReturnTo } from "@nusa/shared";

const dataDir = mkdtempSync(join(tmpdir(), "nusa-c05-"));
process.env.NUSA_DATA_DIR = dataDir;
process.env.NUSA_AUTH_SECRET = "test-secret-at-least-16-chars-long";
process.env.NODE_ENV = "test";
process.env.NUSA_EXPOSE_RECOVERY_TOKENS = "1";

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
        id: "biz-a",
        placeId: "pl-gianyar",
        slug: "warung-a",
        name: "Warung A",
        status: "published",
        categories: ["Food & Drink"],
        summary: "s",
        description: "d",
        gallery: [],
        openingHours: [],
        faq: [],
        bookingMode: "none",
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
    ],
    claims: [],
    reviews: [],
    bookings: [],
    vendors: [],
    invites: [],
    recoveryTokens: [],
    reports: [],
  }),
);

const { app } = await import("../apps/api/dist/app.js");
const { hashStoredPasswords } = await import("../packages/db/dist/repository.js");
await hashStoredPasswords();

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

describe("safePortalReturnTo", () => {
  it("allows claim deep links and rejects open redirects", () => {
    assert.equal(
      safePortalReturnTo("/claim?businessId=biz-a"),
      "/claim?businessId=biz-a",
    );
    assert.equal(safePortalReturnTo("/invites"), "/invites");
    assert.equal(safePortalReturnTo("https://evil.test"), "/");
    assert.equal(safePortalReturnTo("//evil.test"), "/");
    assert.equal(safePortalReturnTo("/unknown"), "/");
  });
});

describe("C05 invite register and claims", () => {
  it("registers via invite and restores claim returnTo", async () => {
    const admin = await json("POST", "/v1/auth/login", {
      body: { email: "admin@example.test", password: "admin-pass-long" },
    });
    assert.equal(admin.status, 200);

    const invite = await json("POST", "/v1/invites", {
      headers: { Authorization: `Bearer ${admin.data.token}` },
      body: { email: "owner-new@example.test", businessId: "biz-a" },
    });
    assert.equal(invite.status, 201);
    assert.ok(invite.data.token);

    const reg = await json("POST", "/v1/auth/register", {
      body: {
        token: invite.data.token,
        name: "New Owner",
        password: "owner-password-12",
      },
    });
    assert.equal(reg.status, 201);
    assert.equal(reg.data.user.email, "owner-new@example.test");
    assert.equal(reg.data.returnTo, "/claim?businessId=biz-a");

    const claim = await json("POST", "/v1/claims", {
      headers: { Authorization: `Bearer ${reg.data.token}` },
      body: { businessId: "biz-a", note: "I own this warung" },
    });
    assert.equal(claim.status, 201);

    const dup = await json("POST", "/v1/claims", {
      headers: { Authorization: `Bearer ${reg.data.token}` },
      body: { businessId: "biz-a", note: "again" },
    });
    assert.equal(dup.status, 409);

    const decide = await json("POST", `/v1/claims/${claim.data.claim.id}/decide`, {
      headers: { Authorization: `Bearer ${admin.data.token}` },
      body: { status: "approved", reason: "Verified on WhatsApp" },
    });
    assert.equal(decide.status, 200);
    assert.equal(decide.data.claim.decidedByUserId, "usr-admin");
    assert.equal(decide.data.claim.decisionReason, "Verified on WhatsApp");

    const again = await json(
      "POST",
      `/v1/claims/${claim.data.claim.id}/decide`,
      {
        headers: { Authorization: `Bearer ${admin.data.token}` },
        body: { status: "rejected" },
      },
    );
    assert.equal(again.status, 409);
  });

  it("issues and consumes recovery tokens", async () => {
    const req = await json("POST", "/v1/auth/recovery/request", {
      body: { email: "owner-new@example.test" },
    });
    assert.equal(req.status, 200);
    assert.ok(req.data.recoveryToken);

    const confirm = await json("POST", "/v1/auth/recovery/confirm", {
      body: {
        token: req.data.recoveryToken,
        password: "owner-password-99",
      },
    });
    assert.equal(confirm.status, 200);

    const login = await json("POST", "/v1/auth/login", {
      body: { email: "owner-new@example.test", password: "owner-password-99" },
    });
    assert.equal(login.status, 200);
  });
});
