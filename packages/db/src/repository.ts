import {
  mkdirSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalizeCategory,
  canonicalizeIslandSlug,
  categoryLabel,
  geoNesting,
  haversineKm,
  listingMatchesCategory,
  listingMatchesFacets,
  normalizeAddress,
  type FacetSelection,
} from "@nusa/shared";
import { migrateStore } from "./migrations.js";
import { hashPassword, isHashed, verifyPassword } from "./password.js";
import { atomicWriteFile, backupPathFor } from "./persist.js";
import { createReferenceStore, createSeed } from "./seed-data.js";
import type {
  Booking,
  Business,
  Claim,
  DataStore,
  Invite,
  ListingReport,
  RecoveryToken,
  Review,
  User,
  VendorStore,
} from "./types.js";
import type { UserRole } from "@nusa/shared";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

/** Re-read on every call so tests can isolate via `NUSA_DATA_DIR`. */
function dataDir(): string {
  return process.env.NUSA_DATA_DIR || join(root, ".data");
}

function storePath(): string {
  return join(dataDir(), "store.json");
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Demo catalog (sample businesses + well-known passwords) is opt-in outside
 * local development. Production never creates it unless an operator sets
 * `NUSA_ALLOW_DEMO_SEED=1` (discouraged — prefer reference + bootstrap admin).
 */
export function allowDemoSeed(): boolean {
  const flag = process.env.NUSA_ALLOW_DEMO_SEED;
  if (flag === "1" || flag === "true") return true;
  if (flag === "0" || flag === "false") return false;
  return !isProductionRuntime();
}

function bootstrapAdminFromEnv(): User | undefined {
  const email = (process.env.NUSA_BOOTSTRAP_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.NUSA_BOOTSTRAP_ADMIN_PASSWORD || "";
  const name = (process.env.NUSA_BOOTSTRAP_ADMIN_NAME || "Nusa Admin").trim();
  if (!email && !password) return undefined;
  if (!email || !password) {
    throw new Error(
      "Bootstrap admin requires both NUSA_BOOTSTRAP_ADMIN_EMAIL and NUSA_BOOTSTRAP_ADMIN_PASSWORD",
    );
  }
  if (password.length < 16) {
    throw new Error(
      "NUSA_BOOTSTRAP_ADMIN_PASSWORD must be at least 16 characters",
    );
  }
  if (!email.includes("@")) {
    throw new Error("NUSA_BOOTSTRAP_ADMIN_EMAIL must be a valid email");
  }
  return {
    id: `usr-bootstrap-${crypto.randomUUID().slice(0, 8)}`,
    email,
    name: name || "Nusa Admin",
    role: "admin",
    // Hashed immediately by hashStoredPasswords() on API startup / seed.
    password,
  };
}

function parseStoreJson(raw: string, label: string): DataStore | null {
  try {
    return JSON.parse(raw) as DataStore;
  } catch (err) {
    console.error(`[db] ${label} is not valid JSON:`, err);
    return null;
  }
}

function readStoreFromDisk(path: string): DataStore | null {
  if (!existsSync(path)) return null;
  return parseStoreJson(readFileSync(path, "utf8"), path);
}

function ensureStore(): DataStore {
  const path = storePath();
  const primary = readStoreFromDisk(path);
  if (primary) return primary;

  const bakPath = backupPathFor(path);
  const backup = readStoreFromDisk(bakPath);
  if (backup) {
    console.warn(`[db] recovered store from ${bakPath}`);
    // Do not rotate the good .bak over the corrupt primary.
    save(backup, { rotateBackup: false });
    return backup;
  }

  if (existsSync(path) || existsSync(bakPath)) {
    throw new Error(
      `Data store at ${path} is unreadable and no usable ${bakPath} backup was found. ` +
        "Restore a known-good backup into NUSA_DATA_DIR before restarting.",
    );
  }

  mkdirSync(dataDir(), { recursive: true });

  if (allowDemoSeed()) {
    const seed = createSeed();
    save(seed);
    return seed;
  }

  // Production / locked environments: geography only, optional bootstrap admin.
  const store = createReferenceStore();
  const admin = bootstrapAdminFromEnv();
  if (admin) {
    store.users.push(admin);
  } else if (isProductionRuntime()) {
    throw new Error(
      "No data store found. In production, set NUSA_BOOTSTRAP_ADMIN_EMAIL and " +
        "NUSA_BOOTSTRAP_ADMIN_PASSWORD (≥16 chars) to create a geography-only " +
        "store with one admin, or restore a backup into NUSA_DATA_DIR. " +
        "Demo seeding is disabled unless NUSA_ALLOW_DEMO_SEED=1.",
    );
  }

  save(store);
  return store;
}

function save(store: DataStore, opts: { rotateBackup?: boolean } = {}) {
  atomicWriteFile(storePath(), JSON.stringify(store, null, 2), opts);
}

export function resetSeed(): DataStore {
  if (isProductionRuntime() && !allowDemoSeed()) {
    throw new Error(
      "Refusing to reset demo seed while NODE_ENV=production without NUSA_ALLOW_DEMO_SEED=1",
    );
  }
  const seed = createSeed();
  save(seed);
  return seed;
}

export function getStore(): DataStore {
  return ensureStore();
}

export function listIslands() {
  return getStore().islands;
}

export function getIslandBySlug(slug: string) {
  const canonical = canonicalizeIslandSlug(slug);
  return getStore().islands.find((i) => i.slug === canonical);
}

export function listPlaces(islandSlug?: string) {
  const store = getStore();
  if (!islandSlug) return store.places;
  const island = getIslandBySlug(islandSlug);
  if (!island) return [];
  return store.places.filter((p) => p.islandId === island.id);
}

export function getPlace(islandSlug: string, placeSlug: string) {
  const island = getIslandBySlug(islandSlug);
  if (!island) return undefined;
  return getStore().places.find(
    (p) => p.islandId === island.id && p.slug === placeSlug,
  );
}

function reviewAverageByBusiness(store: ReturnType<typeof getStore>) {
  const sums = new Map<string, { total: number; count: number }>();
  for (const r of store.reviews) {
    const avg = (r.service + r.value + r.location + r.cleanliness) / 4;
    const cur = sums.get(r.businessId) ?? { total: 0, count: 0 };
    cur.total += avg;
    cur.count += 1;
    sums.set(r.businessId, cur);
  }
  const out = new Map<string, number>();
  for (const [id, { total, count }] of sums) out.set(id, total / count);
  return out;
}

export function listBusinesses(filters?: {
  islandSlug?: string;
  placeSlug?: string;
  category?: string;
  q?: string;
  facets?: FacetSelection;
  origin?: { lat: number; lng: number };
}) {
  const store = getStore();
  let items = store.businesses.filter((b) => b.status !== "draft");

  if (filters?.islandSlug || filters?.placeSlug) {
    const places = listPlaces(filters.islandSlug);
    const placeIds = new Set(
      filters.placeSlug
        ? places.filter((p) => p.slug === filters.placeSlug).map((p) => p.id)
        : places.map((p) => p.id),
    );
    items = items.filter((b) => placeIds.has(b.placeId));
  }

  if (filters?.category) {
    items = items.filter((b) =>
      listingMatchesCategory(b.categories, filters.category!),
    );
  }

  if (filters?.q) {
    const q = filters.q.toLowerCase();
    items = items.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.categories.some((c) => {
          const label = categoryLabel(c).toLowerCase();
          const slug = canonicalizeCategory(c) ?? c.toLowerCase();
          return (
            c.toLowerCase().includes(q) ||
            label.includes(q) ||
            slug.includes(q)
          );
        }),
    );
  }

  if (filters?.facets && Object.keys(filters.facets).length) {
    const selected = { ...filters.facets };
    if (selected.distance && !filters.origin) delete selected.distance;
    if (Object.keys(selected).length) {
      const averages = selected.rating?.length
        ? reviewAverageByBusiness(store)
        : new Map<string, number>();
      items = items.filter((b) =>
        listingMatchesFacets(
          {
            facets: b.facets,
            status: b.status,
            openingHours: b.openingHours,
            ratingAverage: averages.get(b.id) ?? null,
            lat: b.lat,
            lng: b.lng,
            origin: filters.origin,
          },
          selected,
        ),
      );
    }
  }

  return items;
}

export function getBusiness(islandSlug: string, placeSlug: string, slug: string) {
  const place = getPlace(islandSlug, placeSlug);
  if (!place) return undefined;
  return getStore().businesses.find(
    (b) => b.placeId === place.id && b.slug === slug,
  );
}

export function getBusinessById(id: string) {
  return getStore().businesses.find((b) => b.id === id);
}

export class BusinessSlugConflictError extends Error {
  constructor() {
    super("A business with this slug already exists in this place");
    this.name = "BusinessSlugConflictError";
  }
}

export function upsertBusiness(input: Business): Business {
  const store = getStore();
  // Synchronous check and save form one critical section in the single API process.
  if (store.businesses.some((b) =>
    b.id !== input.id && b.placeId === input.placeId && b.slug === input.slug
  )) {
    throw new BusinessSlugConflictError();
  }
  const idx = store.businesses.findIndex((b) => b.id === input.id);
  if (idx >= 0) store.businesses[idx] = input;
  else store.businesses.push(input);
  save(store);
  return input;
}

export function createBusiness(
  data: Omit<Business, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Business {
  const t = new Date().toISOString();
  const business: Business = {
    ...data,
    id: data.id ?? `biz-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: t,
    updatedAt: t,
  };
  return upsertBusiness(business);
}

export function listReviews(businessId: string) {
  return getStore().reviews.filter((r) => r.businessId === businessId);
}

export function addReview(review: Omit<Review, "id" | "createdAt">): Review {
  const store = getStore();
  const row: Review = {
    ...review,
    id: `rev-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
  store.reviews.push(row);
  save(store);
  return row;
}

export function listClaims() {
  return getStore().claims;
}

export class ClaimConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaimConflictError";
  }
}

export function addClaim(
  claim: Omit<Claim, "id" | "createdAt" | "status"> & { status?: Claim["status"] },
): Claim {
  const store = getStore();
  const pendingSame = store.claims.find(
    (c) =>
      c.businessId === claim.businessId &&
      c.claimantUserId === claim.claimantUserId &&
      c.status === "pending",
  );
  if (pendingSame) {
    throw new ClaimConflictError(
      "You already have a pending claim for this listing",
    );
  }
  const row: Claim = {
    ...claim,
    status: claim.status ?? "pending",
    id: `clm-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
  store.claims.push(row);
  save(store);
  return row;
}

export type ClaimDecisionInput = {
  status: "approved" | "rejected";
  actorUserId: string;
  reason?: string;
};

export type ClaimDecisionResult =
  | { ok: true; claim: Claim }
  | { ok: false; error: string; code: "not_found" | "not_pending" | "invalid" };

/**
 * Admin claim decision with audit fields. Approving transfers ownership and
 * rejects other pending claims on the same listing so ownership is not raced.
 */
export function decideClaim(
  id: string,
  input: ClaimDecisionInput,
): ClaimDecisionResult {
  if (input.status !== "approved" && input.status !== "rejected") {
    return { ok: false, error: "status must be approved or rejected", code: "invalid" };
  }
  const store = getStore();
  const claim = store.claims.find((c) => c.id === id);
  if (!claim) return { ok: false, error: "Not found", code: "not_found" };
  if (claim.status !== "pending") {
    return {
      ok: false,
      error: "Claim is already decided",
      code: "not_pending",
    };
  }

  const now = new Date().toISOString();
  claim.status = input.status;
  claim.decidedByUserId = input.actorUserId;
  claim.decidedAt = now;
  if (input.reason?.trim()) claim.decisionReason = input.reason.trim().slice(0, 2000);

  if (input.status === "approved") {
    const biz = store.businesses.find((b) => b.id === claim.businessId);
    if (biz) {
      biz.status = "claimed";
      biz.ownerUserId = claim.claimantUserId;
      biz.verifiedAt = now;
      biz.updatedAt = now;
    }
    for (const other of store.claims) {
      if (
        other.id !== claim.id &&
        other.businessId === claim.businessId &&
        other.status === "pending"
      ) {
        other.status = "rejected";
        other.decidedByUserId = input.actorUserId;
        other.decidedAt = now;
        other.decisionReason =
          other.decisionReason ||
          "Superseded when another claim on this listing was approved";
      }
    }
  }

  save(store);
  return { ok: true, claim };
}

/** @deprecated Prefer decideClaim — kept for any transitional callers. */
export function updateClaim(id: string, status: Claim["status"]): Claim | undefined {
  if (status !== "approved" && status !== "rejected") return undefined;
  const result = decideClaim(id, {
    status,
    actorUserId: "usr-legacy",
    reason: "legacy updateClaim",
  });
  return result.ok ? result.claim : undefined;
}

export function listBookings(businessId?: string) {
  const all = getStore().bookings;
  return businessId ? all.filter((b) => b.businessId === businessId) : all;
}

/** Same customer + listing + dates while still pending — used to block double-submit. */
export function findDuplicatePendingBooking(opts: {
  businessId: string;
  customerEmail: string;
  startDate: string;
  endDate?: string;
  timeSlot?: string;
}): Booking | undefined {
  const email = opts.customerEmail.trim().toLowerCase();
  return getStore().bookings.find(
    (b) =>
      b.businessId === opts.businessId &&
      b.status === "pending" &&
      b.customerEmail.toLowerCase() === email &&
      b.startDate === opts.startDate &&
      (b.endDate || "") === (opts.endDate || "") &&
      (b.timeSlot || "") === (opts.timeSlot || ""),
  );
}

export function addBooking(
  booking: Omit<Booking, "id" | "createdAt" | "status"> & {
    status?: Booking["status"];
  },
): Booking {
  const store = getStore();
  const row: Booking = {
    ...booking,
    status: booking.status ?? "pending",
    id: `bk-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
  store.bookings.push(row);
  save(store);
  return row;
}

export function addListingReport(
  report: Omit<ListingReport, "id" | "createdAt">,
): ListingReport {
  const store = getStore();
  const row: ListingReport = {
    ...report,
    note: report.note.trim().slice(0, 2000),
    id: `rpt-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
  if (!Array.isArray(store.reports)) store.reports = [];
  store.reports.push(row);
  save(store);
  return row;
}

export function listListingReports(businessId?: string) {
  const all = getStore().reports ?? [];
  return businessId ? all.filter((r) => r.businessId === businessId) : all;
}

export function getVendorByBusinessId(businessId: string) {
  return getStore().vendors.find((v) => v.businessId === businessId);
}

export function getVendorById(id: string) {
  return getStore().vendors.find((v) => v.id === id);
}

export function upsertVendor(vendor: VendorStore): VendorStore {
  const store = getStore();
  const idx = store.vendors.findIndex((v) => v.id === vendor.id);
  if (idx >= 0) store.vendors[idx] = vendor;
  else store.vendors.push(vendor);
  const biz = store.businesses.find((b) => b.id === vendor.businessId);
  if (biz) {
    biz.vendorId = vendor.id;
    biz.updatedAt = new Date().toISOString();
  }
  save(store);
  return vendor;
}

/**
 * Bring an existing store up to date with the current data model.
 *
 * Seeding only happens when no store file exists, so changes to seed-data.ts
 * never reach a deployed store on their own. Runs at API startup. Idempotent.
 * Returns the ids of migrations that changed something.
 */
export function applyStoreMigrations(): string[] {
  const store = ensureStore();
  const applied = migrateStore(store);
  if (applied.length > 0) save(store);
  return applied;
}

/**
 * Hash any plaintext passwords in the store, in place.
 *
 * Called at API startup and after seeding, so a store is never left at rest
 * with readable passwords. Returns how many entries were upgraded.
 */
export async function hashStoredPasswords(): Promise<number> {
  const store = ensureStore();
  let upgraded = 0;
  for (const user of store.users) {
    if (!isHashed(user.password)) {
      user.password = await hashPassword(user.password);
      upgraded++;
    }
  }
  if (upgraded > 0) save(store);
  return upgraded;
}

export async function authenticate(email: string, password: string) {
  const store = ensureStore();
  const user = store.users.find((u) => u.email === email);
  if (!user) {
    // Hash anyway so a missing account costs the same as a wrong password.
    await hashPassword(password);
    return undefined;
  }
  if (!(await verifyPassword(password, user.password))) return undefined;

  // Upgrade a legacy plaintext entry now that we know the password is right.
  if (!isHashed(user.password)) {
    user.password = await hashPassword(password);
    save(store);
  }
  return user;
}

export function getUser(id: string) {
  return getStore().users.find((u) => u.id === id);
}

export function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return getStore().users.find((u) => u.email.toLowerCase() === normalized);
}

export function resolveBusinessContext(businessId: string) {
  const store = getStore();
  const business = store.businesses.find((b) => b.id === businessId);
  if (!business) return null;
  const place = store.places.find((p) => p.id === business.placeId);
  if (!place) return null;
  const island = store.islands.find((i) => i.id === place.islandId);
  if (!island) return null;
  const placesById = Object.fromEntries(store.places.map((p) => [p.id, p]));
  return { business, place, island, geo: geoNesting(place, placesById) };
}

export type DiscoveryNeighbor = {
  business: Business;
  place: { id: string; slug: string; name: string };
  island: { id: string; slug: string; name: string };
  geo: { hostPlace: string; area?: string };
  distanceKm: number;
};

export type BusinessDiscovery = {
  origin: { lat: number; lng: number; address?: string } | null;
  radiusKm: number;
  sameAddress: DiscoveryNeighbor[];
  similar: DiscoveryNeighbor[];
  nearbyCategories: string[];
  nearby: DiscoveryNeighbor[];
  activeCategory: string | null;
};

/**
 * Same-address peers, similar businesses within radius, and category-filtered
 * nearby set for the listing discovery panels.
 */
export function getBusinessDiscovery(
  businessId: string,
  opts: { radiusKm?: number; category?: string; similarLimit?: number } = {},
): BusinessDiscovery | null {
  const ctx = resolveBusinessContext(businessId);
  if (!ctx) return null;
  const { business: self } = ctx;
  const radiusKm = opts.radiusKm ?? 2;
  const similarLimit = opts.similarLimit ?? 10;
  const store = getStore();

  const selfAddr = normalizeAddress(self.address);
  const sameAddress: DiscoveryNeighbor[] = [];
  const withDistance: DiscoveryNeighbor[] = [];
  const placesById = Object.fromEntries(store.places.map((p) => [p.id, p]));

  for (const b of store.businesses) {
    if (b.id === self.id || b.status === "draft") continue;
    const peerCtx = resolveBusinessContext(b.id);
    if (!peerCtx) continue;
    const row: DiscoveryNeighbor = {
      business: b,
      place: {
        id: peerCtx.place.id,
        slug: peerCtx.place.slug,
        name: peerCtx.place.name,
      },
      island: {
        id: peerCtx.island.id,
        slug: peerCtx.island.slug,
        name: peerCtx.island.name,
      },
      geo: geoNesting(peerCtx.place, placesById),
      distanceKm: 0,
    };

    if (selfAddr && normalizeAddress(b.address) === selfAddr) {
      sameAddress.push(row);
    }

    if (
      typeof self.lat === "number" &&
      typeof self.lng === "number" &&
      typeof b.lat === "number" &&
      typeof b.lng === "number"
    ) {
      const distanceKm = haversineKm(self.lat, self.lng, b.lat, b.lng);
      if (distanceKm <= radiusKm) {
        withDistance.push({ ...row, distanceKm });
      }
    }
  }

  sameAddress.sort((a, b) => a.business.name.localeCompare(b.business.name));
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  const sameIds = new Set(sameAddress.map((n) => n.business.id));
  const similar = withDistance
    .filter(
      (n) =>
        !sameIds.has(n.business.id) &&
        n.business.categories.some((c) => {
          const slug = canonicalizeCategory(c);
          return (
            !!slug &&
            self.categories.some((s) => canonicalizeCategory(s) === slug)
          );
        }),
    )
    .slice(0, similarLimit);

  const categoryCounts = new Map<string, number>();
  for (const n of withDistance) {
    for (const c of n.business.categories) {
      const slug = canonicalizeCategory(c) ?? c;
      categoryCounts.set(slug, (categoryCounts.get(slug) ?? 0) + 1);
    }
  }
  const nearbyCategories = [...categoryCounts.keys()].sort((a, b) =>
    a.localeCompare(b),
  );

  const requested = opts.category
    ? canonicalizeCategory(opts.category) ?? opts.category
    : null;

  let activeCategory: string | null = null;
  if (requested && nearbyCategories.includes(requested)) {
    activeCategory = requested;
  } else {
    activeCategory =
      self.categories
        .map((c) => canonicalizeCategory(c) ?? c)
        .find((c) => nearbyCategories.includes(c)) ??
      nearbyCategories[0] ??
      null;
  }

  const nearby = activeCategory
    ? withDistance.filter((n) =>
        listingMatchesCategory(n.business.categories, activeCategory!),
      )
    : [];

  const origin =
    typeof self.lat === "number" && typeof self.lng === "number"
      ? { lat: self.lat, lng: self.lng, address: self.address }
      : null;

  return {
    origin,
    radiusKm,
    sameAddress,
    similar,
    nearbyCategories,
    nearby,
    activeCategory,
  };
}

function hashOpaqueToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function createInvite(input: {
  email: string;
  role: UserRole;
  createdByUserId: string;
  businessId?: string;
  ttlHours?: number;
}): { invite: Invite; rawToken: string } {
  const store = getStore();
  const email = input.email.trim().toLowerCase();
  const rawToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const ttlMs = (input.ttlHours ?? 72) * 60 * 60 * 1000;
  const invite: Invite = {
    id: `inv-${crypto.randomUUID().slice(0, 8)}`,
    email,
    role: input.role,
    tokenHash: hashOpaqueToken(rawToken),
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    createdByUserId: input.createdByUserId,
    createdAt: new Date().toISOString(),
    businessId: input.businessId,
  };
  store.invites.push(invite);
  save(store);
  return { invite, rawToken };
}

export function findValidInvite(rawToken: string): Invite | undefined {
  const hash = hashOpaqueToken(rawToken);
  const now = Date.now();
  return getStore().invites.find(
    (i) =>
      i.tokenHash === hash &&
      !i.usedAt &&
      Date.parse(i.expiresAt) > now,
  );
}

export async function redeemInvite(input: {
  rawToken: string;
  name: string;
  password: string;
}): Promise<
  | { ok: true; user: User; invite: Invite }
  | { ok: false; error: string }
> {
  const store = getStore();
  const hash = hashOpaqueToken(input.rawToken);
  const invite = store.invites.find((i) => i.tokenHash === hash);
  if (!invite) return { ok: false, error: "Invalid invitation" };
  if (invite.usedAt) return { ok: false, error: "Invitation already used" };
  if (Date.parse(invite.expiresAt) <= Date.now()) {
    return { ok: false, error: "Invitation expired" };
  }
  if (getUserByEmail(invite.email)) {
    return { ok: false, error: "An account with this email already exists" };
  }
  if (input.password.length < 12) {
    return { ok: false, error: "Password must be at least 12 characters" };
  }
  const name = input.name.trim();
  if (name.length < 1 || name.length > 120) {
    return { ok: false, error: "Name is required" };
  }
  const user: User = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    email: invite.email,
    name,
    role: invite.role,
    password: await hashPassword(input.password),
  };
  store.users.push(user);
  invite.usedAt = new Date().toISOString();
  save(store);
  return { ok: true, user, invite };
}

/**
 * Public owner signup. Role is always `owner` — clients cannot self-assign
 * admin or field_agent. Claim approval is still required before editing an
 * existing listing.
 */
export async function registerOwner(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "email must be a valid email" };
  }
  if (getUserByEmail(email)) {
    return { ok: false, error: "An account with this email already exists" };
  }
  if (input.password.length < 12) {
    return { ok: false, error: "Password must be at least 12 characters" };
  }
  const name = input.name.trim();
  if (name.length < 1 || name.length > 120) {
    return { ok: false, error: "Name is required" };
  }
  const store = getStore();
  const user: User = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    email,
    name,
    role: "owner",
    password: await hashPassword(input.password),
  };
  store.users.push(user);
  save(store);
  return { ok: true, user };
}

export function createRecoveryToken(userId: string, ttlHours = 2): {
  token: RecoveryToken;
  rawToken: string;
} {
  const store = getStore();
  const rawToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const token: RecoveryToken = {
    id: `rcv-${crypto.randomUUID().slice(0, 8)}`,
    userId,
    tokenHash: hashOpaqueToken(rawToken),
    expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  store.recoveryTokens.push(token);
  save(store);
  return { token, rawToken };
}

export async function consumeRecoveryToken(input: {
  rawToken: string;
  newPassword: string;
}): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  if (input.newPassword.length < 12) {
    return { ok: false, error: "Password must be at least 12 characters" };
  }
  const store = getStore();
  const hash = hashOpaqueToken(input.rawToken);
  const token = store.recoveryTokens.find((t) => t.tokenHash === hash);
  if (!token) return { ok: false, error: "Invalid recovery link" };
  if (token.usedAt) return { ok: false, error: "Recovery link already used" };
  if (Date.parse(token.expiresAt) <= Date.now()) {
    return { ok: false, error: "Recovery link expired" };
  }
  const user = store.users.find((u) => u.id === token.userId);
  if (!user) return { ok: false, error: "Invalid recovery link" };
  user.password = await hashPassword(input.newPassword);
  token.usedAt = new Date().toISOString();
  save(store);
  return { ok: true, user };
}

export * from "./types.js";
export {
  createSeed,
  createReferenceStore,
  DEMO_ACCOUNT_EMAILS,
} from "./seed-data.js";
