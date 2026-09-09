import assert from "node:assert/strict";
import { after, before, it } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";

process.env.NUSA_AUTH_SECRET = "test-secret-at-least-16-chars-long";
process.env.NUSA_DATA_DIR = mkdtempSync(join(tmpdir(), "nusa-write-security-"));
const db = await import("../packages/db/dist/index.js");
const { issueToken } = await import("../apps/api/dist/auth.js");
const seed = db.resetSeed();
const owner = seed.users.find((u) => u.role === "owner");
const admin = seed.users.find((u) => u.role === "admin");
const agent = seed.users.find((u) => u.role === "field_agent");
const template = seed.businesses[0];
const makeBusiness = (id, overrides = {}) => db.upsertBusiness({
  ...template, id, slug: id, status: "published", ownerUserId: owner.id,
  bookingMode: "service", ...overrides,
});
const bookingBusiness = makeBusiness("security-booking");
const listing = makeBusiness("security-listing");
const occupied = makeBusiness("security-occupied", { status: "draft" });
let server;
let base;
let logs = "";
const request = (path, body, user, headers = {}, method = "POST") => fetch(`${base}${path}`, {
  method, headers: { "content-type": "application/json", ...(user ? { authorization: `Bearer ${issueToken(user)}` } : {}), ...headers },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

before(async () => {
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ["apps/api/dist/index.js"], {
    env: { ...process.env, PORT: String(port), NUSA_RATELIMIT_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (data) => { logs += data; });
  server.stderr.on("data", (data) => { logs += data; });
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(`${base}/health`)).ok) return; } catch {}
    if (server.exitCode !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`API did not start: ${logs}`);
});
after(async () => {
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
  rmSync(process.env.NUSA_DATA_DIR, { recursive: true, force: true });
});

it("rejects every changed booking field without disclosing or duplicating the first booking", async () => {
  const path = `/v1/businesses/${bookingBusiness.id}/bookings`;
  const body = { customerName: "First Customer", customerEmail: "first@example.test", customerPhone: "1234", startDate: "2027-02-28", endDate: "2027-03-01", timeSlot: "10:00", guests: 2, tickets: 3, notes: "Private note" };
  const headers = { "idempotency-key": "predictable-key" };
  const first = await request(path, body, undefined, headers);
  assert.equal(first.status, 201);
  const created = (await first.json()).booking;
  const changes = { customerName: "Second Customer", customerEmail: "second@example.test", customerPhone: "5678", startDate: "2027-02-27", endDate: "2027-03-02", timeSlot: "11:00", guests: 4, tickets: 5, notes: "Different note" };
  for (const [key, value] of Object.entries(changes)) {
    const res = await request(path, { ...body, [key]: value }, undefined, headers);
    assert.equal(res.status, 409, key);
    assert.deepEqual(await res.json(), { error: "Idempotency key already used for a different request" });
  }
  const omitted = { ...body }; delete omitted.notes;
  assert.equal((await request(path, omitted, undefined, headers)).status, 409);
  const reordered = Object.fromEntries(Object.entries(body).reverse());
  const replay = await request(path, { ...reordered, customerName: " First Customer ", totalAmount: 123 }, undefined, headers);
  assert.equal(replay.status, 200);
  assert.deepEqual(await replay.json(), { booking: created, idempotentReplay: true });
  assert.equal(db.listBookings(bookingBusiness.id).length, 1);
  assert.equal((await request(path, body, undefined, { "idempotency-key": "x".repeat(129) })).status, 400);
  const other = makeBusiness("security-other-booking");
  assert.equal((await request(`/v1/businesses/${other.id}/bookings`, body, undefined, headers)).status, 201);
});

it("public listing reads omit customer bookings while owners retain access", async () => {
  const { island, place } = db.resolveBusinessContext(bookingBusiness.id);
  const res = await fetch(`${base}/v1/islands/${island.slug}/places/${place.slug}/businesses/${bookingBusiness.slug}`);
  assert.equal(res.status, 200);
  assert.equal("bookings" in await res.json(), false);
  const owned = await request(`/v1/bookings?businessId=${bookingBusiness.id}`, undefined, owner, {}, "GET");
  assert.equal(owned.status, 200);
  assert.equal((await owned.json()).bookings.length, 1);
});

it("blocks owner self-claim via patch and creation, preserving admin claim approval", async () => {
  const path = `/v1/portal/listings/${listing.id}`;
  assert.equal((await request(path, { status: "claimed" }, owner, {}, "PATCH")).status, 400);
  assert.equal(db.getBusinessById(listing.id).status, "published");
  const creation = { placeId: listing.placeId, name: "Security Creation", summary: "Summary", description: "Description", categories: listing.categories, status: "claimed" };
  assert.equal((await request("/v1/portal/listings", creation, owner)).status, 400);
  assert.equal((await request("/v1/portal/listings", { ...creation, status: "published" }, owner)).status, 201);
  const claim = db.addClaim({ businessId: listing.id, claimantUserId: owner.id });
  assert.equal((await request(`/v1/claims/${claim.id}/decide`, { status: "approved" }, owner)).status, 403);
  assert.equal((await request(`/v1/claims/${claim.id}/decide`, { status: "approved" }, admin)).status, 200);
  const edited = await request(path, { summary: "Updated summary" }, owner, {}, "PATCH");
  assert.equal(edited.status, 200);
  assert.equal((await edited.json()).business.status, "claimed");
});

it("enforces unique place + slug in persistence and all write routes", async () => {
  const path = `/v1/portal/listings/${listing.id}`;
  assert.equal((await request(path, { slug: occupied.slug }, owner, {}, "PATCH")).status, 409);
  assert.equal(db.getBusinessById(listing.id).slug, listing.slug);
  assert.throws(() => db.upsertBusiness({ ...listing, slug: occupied.slug }), db.BusinessSlugConflictError);
  const results = await Promise.all([listing, bookingBusiness].map((b) => request(`/v1/portal/listings/${b.id}`, { slug: "security-race" }, owner, {}, "PATCH")));
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  assert.equal(db.getStore().businesses.filter((b) => b.placeId === listing.placeId && b.slug === "security-race").length, 1);
  const fresh = db.getBusinessById(listing.id);
  assert.equal((await request(path, { slug: fresh.slug }, owner, {}, "PATCH")).status, 200);
  const otherPlace = seed.places.find((p) => p.id !== listing.placeId);
  assert.equal(makeBusiness("security-other-place", { placeId: otherPlace.id, slug: occupied.slug }).slug, occupied.slug);
  const creation = { placeId: listing.placeId, name: "security-occupied", summary: "Summary", description: "Description", categories: listing.categories };
  assert.equal((await request("/v1/portal/listings", creation, owner)).status, 409);
  const { island, place } = db.resolveBusinessContext(listing.id);
  assert.equal((await request("/v1/field/register", { ...creation, islandSlug: island.slug, placeSlug: place.slug }, agent)).status, 409);
});

it("impossible booking dates never reach persistence", async () => {
  const count = db.listBookings(bookingBusiness.id).length;
  const res = await request(`/v1/businesses/${bookingBusiness.id}/bookings`, { customerName: "Invalid Date", customerEmail: "date@example.test", startDate: "2026-02-30" });
  assert.equal(res.status, 400);
  assert.equal(db.listBookings(bookingBusiness.id).length, count);
});

it("rejects past booking dates and duplicate pending requests", async () => {
  const biz = makeBusiness("security-booking-dup");
  const past = await request(`/v1/businesses/${biz.id}/bookings`, {
    customerName: "Sam",
    customerEmail: "dup@example.test",
    startDate: "2020-01-01",
  });
  assert.equal(past.status, 400);
  const body = {
    customerName: "Sam",
    customerEmail: "dup@example.test",
    startDate: "2027-06-01",
  };
  const first = await request(`/v1/businesses/${biz.id}/bookings`, body);
  assert.equal(first.status, 201);
  const dup = await request(`/v1/businesses/${biz.id}/bookings`, body);
  assert.equal(dup.status, 409);
});
