import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalizeIslandSlug } from "@nusa/shared";
import { migrateStore } from "./migrations.js";
import { hashPassword, isHashed, verifyPassword } from "./password.js";
import { createReferenceStore, createSeed } from "./seed-data.js";
import type {
  Booking,
  Business,
  Claim,
  DataStore,
  Review,
  User,
  VendorStore,
} from "./types.js";

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

function ensureStore(): DataStore {
  const path = storePath();
  if (existsSync(path)) {
    return JSON.parse(readFileSync(path, "utf8")) as DataStore;
  }

  mkdirSync(dataDir(), { recursive: true });

  if (allowDemoSeed()) {
    const seed = createSeed();
    writeFileSync(path, JSON.stringify(seed, null, 2));
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

  writeFileSync(path, JSON.stringify(store, null, 2));
  return store;
}

function save(store: DataStore) {
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(storePath(), JSON.stringify(store, null, 2));
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

export function listBusinesses(filters?: {
  islandSlug?: string;
  placeSlug?: string;
  category?: string;
  q?: string;
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
    items = items.filter((b) => b.categories.includes(filters.category!));
  }

  if (filters?.q) {
    const q = filters.q.toLowerCase();
    items = items.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.categories.some((c) => c.toLowerCase().includes(q)),
    );
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

export function upsertBusiness(input: Business): Business {
  const store = getStore();
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

export function addClaim(claim: Omit<Claim, "id" | "createdAt" | "status"> & { status?: Claim["status"] }): Claim {
  const store = getStore();
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

export function updateClaim(id: string, status: Claim["status"]): Claim | undefined {
  const store = getStore();
  const claim = store.claims.find((c) => c.id === id);
  if (!claim) return undefined;
  claim.status = status;
  if (status === "approved") {
    const biz = store.businesses.find((b) => b.id === claim.businessId);
    if (biz) {
      biz.status = "claimed";
      biz.ownerUserId = claim.claimantUserId;
      biz.updatedAt = new Date().toISOString();
    }
  }
  save(store);
  return claim;
}

export function listBookings(businessId?: string) {
  const all = getStore().bookings;
  return businessId ? all.filter((b) => b.businessId === businessId) : all;
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

export function resolveBusinessContext(businessId: string) {
  const store = getStore();
  const business = store.businesses.find((b) => b.id === businessId);
  if (!business) return null;
  const place = store.places.find((p) => p.id === business.placeId);
  if (!place) return null;
  const island = store.islands.find((i) => i.id === place.islandId);
  if (!island) return null;
  return { business, place, island };
}

export * from "./types.js";
export {
  createSeed,
  createReferenceStore,
  DEMO_ACCOUNT_EMAILS,
} from "./seed-data.js";
