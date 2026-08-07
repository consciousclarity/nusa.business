import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createSeed } from "./seed-data.js";
import type {
  Booking,
  Business,
  Claim,
  DataStore,
  Review,
  VendorStore,
} from "./types.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const dataDir = process.env.NUSA_DATA_DIR || join(root, ".data");
const storePath = join(dataDir, "store.json");

function ensureStore(): DataStore {
  if (!existsSync(storePath)) {
    mkdirSync(dataDir, { recursive: true });
    const seed = createSeed();
    writeFileSync(storePath, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(readFileSync(storePath, "utf8")) as DataStore;
}

function save(store: DataStore) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

export function resetSeed(): DataStore {
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
  return getStore().islands.find((i) => i.slug === slug);
}

export function listPlaces(islandSlug?: string) {
  const store = getStore();
  if (!islandSlug) return store.places;
  const island = store.islands.find((i) => i.slug === islandSlug);
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

export function authenticate(email: string, password: string) {
  return getStore().users.find(
    (u) => u.email === email && u.password === password,
  );
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
export { createSeed } from "./seed-data.js";
