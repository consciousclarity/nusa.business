import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  addBooking,
  addClaim,
  addReview,
  authenticate,
  createBusiness,
  getBusiness,
  getBusinessById,
  getIslandBySlug,
  getPlace,
  getStore,
  applyStoreMigrations,
  getVendorByBusinessId,
  hashStoredPasswords,
  getVendorById,
  listBookings,
  listBusinesses,
  listClaims,
  listIslands,
  listPlaces,
  listReviews,
  resolveBusinessContext,
  updateClaim,
  upsertBusiness,
  upsertVendor,
} from "@nusa/db";
import { CATEGORIES, parseHost, toSlug } from "@nusa/shared";
import {
  type AuthVariables,
  issueToken,
  ownsOrAdmin,
  requireAuth,
  requireRole,
} from "./auth.js";

const app = new Hono<{ Variables: AuthVariables }>();

app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ ok: true, service: "nusa-api" }));

function filterByOwner<T extends { ownerUserId?: string }>(
  rows: T[],
  ownerId?: string,
): T[] {
  return ownerId ? rows.filter((row) => row.ownerUserId === ownerId) : rows;
}

app.get("/v1/meta/categories", (c) => c.json({ categories: CATEGORIES }));

app.get("/v1/host", (c) => {
  const host = c.req.header("x-forwarded-host") || c.req.header("host") || "";
  return c.json({ host, context: parseHost(host) });
});

/** Subdomains that route to their own service rather than a geo tenant. */
const RESERVED_HOSTS = new Set([
  "nusa.business",
  "www.nusa.business",
  "api.nusa.business",
  "portal.nusa.business",
]);

/**
 * Caddy `on_demand_tls` ask endpoint.
 *
 * Nested hosts (gianyar.bali.nusa.business) can't be covered by a wildcard
 * certificate, so Caddy issues one per hostname on first request. This gates
 * that: 200 means "real tenant, go ahead", anything else means Caddy refuses,
 * so a stranger pointing DNS at the origin can't burn our issuance quota.
 */
app.get("/v1/tls-check", (c) => {
  const domain = (c.req.query("domain") || "").toLowerCase().trim();
  if (!domain) return c.json({ error: "domain required" }, 400);
  if (RESERVED_HOSTS.has(domain)) return c.json({ ok: true });

  const context = parseHost(domain);
  if (context.kind === "nation") return c.json({ ok: true });
  if (context.kind === "island") {
    return getIslandBySlug(context.island)
      ? c.json({ ok: true })
      : c.json({ error: "Unknown island" }, 404);
  }
  if (context.kind === "place") {
    return getPlace(context.island, context.place)
      ? c.json({ ok: true })
      : c.json({ error: "Unknown place" }, 404);
  }
  return c.json({ error: "Unknown host" }, 404);
});

app.get("/v1/islands", (c) => c.json({ islands: listIslands() }));

app.get("/v1/islands/:island", (c) => {
  const island = getIslandBySlug(c.req.param("island"));
  if (!island) return c.json({ error: "Island not found" }, 404);
  const places = listPlaces(island.slug);
  const businesses = listBusinesses({ islandSlug: island.slug });
  return c.json({ island, places, businesses });
});

app.get("/v1/islands/:island/places/:place", (c) => {
  const place = getPlace(c.req.param("island"), c.req.param("place"));
  if (!place) return c.json({ error: "Place not found" }, 404);
  const island = getIslandBySlug(c.req.param("island"))!;
  const businesses = listBusinesses({
    islandSlug: island.slug,
    placeSlug: place.slug,
    category: c.req.query("category") || undefined,
    q: c.req.query("q") || undefined,
  });
  return c.json({ island, place, businesses });
});

app.get("/v1/islands/:island/places/:place/businesses/:slug", (c) => {
  const business = getBusiness(
    c.req.param("island"),
    c.req.param("place"),
    c.req.param("slug"),
  );
  if (!business) return c.json({ error: "Business not found" }, 404);
  const reviews = listReviews(business.id);
  const vendor = getVendorByBusinessId(business.id);
  const bookings = listBookings(business.id);
  return c.json({ business, reviews, vendor, bookings });
});

app.get("/v1/search", (c) => {
  const q = c.req.query("q") || undefined;
  const island = c.req.query("island") || undefined;
  const place = c.req.query("place") || undefined;
  const category = c.req.query("category") || undefined;
  const businesses = listBusinesses({
    q,
    islandSlug: island,
    placeSlug: place,
    category,
  });
  return c.json({
    results: businesses.map((b) => {
      const ctx = resolveBusinessContext(b.id);
      return { business: b, place: ctx?.place, island: ctx?.island };
    }),
  });
});

app.post("/v1/auth/login", async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  if (!body?.email || !body?.password) {
    return c.json({ error: "email and password required" }, 400);
  }
  const user = await authenticate(body.email, body.password);
  if (!user) return c.json({ error: "Invalid credentials" }, 401);
  const { password: _, ...safe } = user;
  return c.json({ user: safe, token: issueToken(user) });
});

app.get("/v1/me", requireAuth, (c) => c.json({ user: c.get("user") }));

app.get("/v1/portal/listings", requireAuth, (c) => {
  const user = c.get("user");
  const store = getStore();
  // Admins may list everything (optionally filtered); everyone else is
  // restricted to their own listings regardless of what they ask for.
  const businesses =
    user.role === "admin"
      ? filterByOwner(store.businesses, c.req.query("ownerId"))
      : store.businesses.filter((b) => b.ownerUserId === user.id);
  return c.json({
    businesses: businesses.map((b) => ({
      business: b,
      context: resolveBusinessContext(b.id),
    })),
  });
});

app.post(
  "/v1/portal/listings",
  requireRole("owner", "vendor", "field_agent", "admin"),
  async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{
      placeId: string;
      name: string;
      summary: string;
      description: string;
      categories: string[];
      address?: string;
      phone?: string;
      whatsapp?: string;
      bookingMode?: "none" | "service" | "rental" | "event";
      ownerUserId?: string;
      status?: "draft" | "published" | "claimed";
    }>();
    const business = createBusiness({
      placeId: body.placeId,
      slug: toSlug(body.name),
      name: body.name,
      summary: body.summary,
      description: body.description,
      categories: body.categories,
      address: body.address,
      phone: body.phone,
      whatsapp: body.whatsapp,
      bookingMode: body.bookingMode ?? "none",
      // Only an admin may create a listing on someone else's behalf.
      ownerUserId:
        user.role === "admin" ? (body.ownerUserId ?? user.id) : user.id,
      status: body.status ?? "published",
      gallery: [],
      openingHours: [],
      faq: [],
    });
    return c.json({ business }, 201);
  },
);

app.patch("/v1/portal/listings/:id", requireAuth, async (c) => {
  const existing = getBusinessById(c.req.param("id"));
  if (!existing) return c.json({ error: "Not found" }, 404);
  if (!ownsOrAdmin(c.get("user"), existing.ownerUserId)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const body = await c.req.json<Partial<typeof existing>>();
  const updated = upsertBusiness({
    ...existing,
    ...body,
    // Identity and ownership are not client-editable.
    id: existing.id,
    ownerUserId: existing.ownerUserId,
    updatedAt: new Date().toISOString(),
  });
  return c.json({ business: updated });
});

app.post("/v1/claims", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ businessId: string; note?: string }>();
  if (!getBusinessById(body.businessId)) {
    return c.json({ error: "Business not found" }, 404);
  }
  // The claimant is always the caller — never taken from the request body.
  const claim = addClaim({
    businessId: body.businessId,
    claimantUserId: user.id,
    note: body.note,
  });
  return c.json({ claim }, 201);
});

app.get("/v1/claims", requireAuth, (c) => {
  const user = c.get("user");
  const claims = listClaims();
  return c.json({
    claims:
      user.role === "admin"
        ? claims
        : claims.filter((claim) => claim.claimantUserId === user.id),
  });
});

app.post("/v1/claims/:id/decide", requireRole("admin"), async (c) => {
  const body = await c.req.json<{ status: "approved" | "rejected" }>();
  if (body.status !== "approved" && body.status !== "rejected") {
    return c.json({ error: "status must be approved or rejected" }, 400);
  }
  const claim = updateClaim(c.req.param("id"), body.status);
  if (!claim) return c.json({ error: "Not found" }, 404);
  return c.json({ claim });
});

app.post("/v1/businesses/:id/reviews", async (c) => {
  const body = await c.req.json<{
    authorName: string;
    authorEmail?: string;
    service: number;
    value: number;
    location: number;
    cleanliness: number;
    comment: string;
  }>();
  const review = addReview({ ...body, businessId: c.req.param("id") });
  return c.json({ review }, 201);
});

app.post("/v1/businesses/:id/bookings", async (c) => {
  const business = getBusinessById(c.req.param("id"));
  if (!business) return c.json({ error: "Not found" }, 404);
  if (business.bookingMode === "none") {
    return c.json({ error: "Booking not enabled" }, 400);
  }
  const body = await c.req.json<{
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    startDate: string;
    endDate?: string;
    timeSlot?: string;
    guests?: number;
    tickets?: number;
    notes?: string;
    totalAmount?: number;
  }>();
  const booking = addBooking({
    businessId: business.id,
    mode: business.bookingMode,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    startDate: body.startDate,
    endDate: body.endDate,
    timeSlot: body.timeSlot,
    guests: body.guests,
    tickets: body.tickets,
    notes: body.notes,
    totalAmount: body.totalAmount ?? 0,
    currency: "IDR",
  });
  return c.json({ booking }, 201);
});

app.get("/v1/bookings", requireAuth, (c) => {
  const user = c.get("user");
  const businessId = c.req.query("businessId") || undefined;
  const bookings = listBookings(businessId);
  if (user.role === "admin") return c.json({ bookings });
  // Owners only ever see bookings for businesses they own.
  const owned = new Set(
    getStore()
      .businesses.filter((b) => b.ownerUserId === user.id)
      .map((b) => b.id),
  );
  return c.json({ bookings: bookings.filter((b) => owned.has(b.businessId)) });
});

/** Field-ops: register a business on the ground */
app.post("/v1/field/register", requireRole("field_agent", "admin"), async (c) => {
  const agent = c.get("user");
  const body = await c.req.json<{
    islandSlug: string;
    placeSlug: string;
    name: string;
    summary: string;
    description?: string;
    categories: string[];
    phone?: string;
    whatsapp?: string;
    address?: string;
    bookingMode?: "none" | "service" | "rental" | "event";
  }>();
  const place = getPlace(body.islandSlug, body.placeSlug);
  if (!place) return c.json({ error: "Place not found" }, 404);

  const business = createBusiness({
    placeId: place.id,
    slug: toSlug(body.name),
    name: body.name,
    summary: body.summary,
    description: body.description || body.summary,
    categories: body.categories,
    phone: body.phone,
    whatsapp: body.whatsapp,
    address: body.address,
    bookingMode: body.bookingMode ?? "none",
    status: "published",
    registeredByAgentId: agent.id,
    gallery: [],
    openingHours: [],
    faq: [],
  });

  return c.json(
    {
      business,
      context: resolveBusinessContext(business.id),
      message: "Registered by field agent — owner can claim for free",
    },
    201,
  );
});

app.get("/v1/field/recent", (c) => {
  const island = c.req.query("island");
  const place = c.req.query("place");
  const businesses = listBusinesses({
    islandSlug: island || undefined,
    placeSlug: place || undefined,
  })
    .filter((b) => b.registeredByAgentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 12);
  return c.json({
    businesses: businesses.map((b) => ({
      business: b,
      context: resolveBusinessContext(b.id),
    })),
  });
});

/** multi-vendor marketplace endpoints (OSS stub ready for Mercur link) */
app.get("/v1/marketplace/vendors/:id", (c) => {
  const vendor = getVendorById(c.req.param("id"));
  if (!vendor) return c.json({ error: "Vendor not found" }, 404);
  return c.json({
    vendor,
    mercur: {
      status: "linked-local",
      note: "Replace vendor.id with Mercur vendor UUID when Mercur is deployed",
      commissionPercent: vendor.commissionPercent,
    },
  });
});

app.post("/v1/marketplace/vendors", requireAuth, async (c) => {
  const body = await c.req.json<{
    businessId: string;
    name: string;
    description?: string;
  }>();
  const business = getBusinessById(body.businessId);
  if (!business) return c.json({ error: "Business not found" }, 404);
  if (!ownsOrAdmin(c.get("user"), business.ownerUserId)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const vendor = upsertVendor({
    id: `vnd-${crypto.randomUUID().slice(0, 8)}`,
    businessId: business.id,
    name: body.name,
    slug: toSlug(body.name),
    description: body.description || "",
    commissionPercent: 0,
    products: [],
    createdAt: new Date().toISOString(),
  });
  return c.json({ vendor }, 201);
});

app.get("/v1/places", (c) => {
  const island = c.req.query("island") || undefined;
  return c.json({ places: listPlaces(island) });
});

const port = Number(process.env.PORT || 8787);

// An existing store is never re-seeded, so bring it up to date first —
// slugs are routing keys, and a stale one breaks host resolution and TLS
// issuance, not just a page.
const migrated = applyStoreMigrations();
if (migrated.length > 0) {
  console.log(`Applied store migration(s): ${migrated.join(", ")}`);
}

// Never leave the store at rest with readable passwords, including a store
// seeded before hashing existed.
const upgraded = await hashStoredPasswords();
if (upgraded > 0) {
  console.log(`Hashed ${upgraded} plaintext password(s) in the store`);
}

console.log(`Nusa API listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
