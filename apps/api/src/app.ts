import { Hono } from "hono";
import type { Context } from "hono";
import { cors } from "hono/cors";
import {
  BusinessSlugConflictError,
  ClaimConflictError,
  addBooking,
  addClaim,
  addListingReport,
  addReview,
  authenticate,
  consumeRecoveryToken,
  createBusiness,
  createInvite,
  createRecoveryToken,
  decideClaim,
  findDuplicatePendingBooking,
  findValidInvite,
  getBusiness,
  getBusinessById,
  getBusinessDiscovery,
  getIslandBySlug,
  getPlace,
  getStore,
  getUserByEmail,
  getVendorByBusinessId,
  getVendorById,
  listBookings,
  listBusinesses,
  listClaims,
  listIslands,
  listListingReports,
  listPlaces,
  listReviews,
  redeemInvite,
  registerOwner,
  resolveBusinessContext,
  upsertBusiness,
  upsertVendor,
} from "@nusa/db";
import {
  CATEGORIES,
  parseCorsOriginAllowlist,
  parseFacetQueryParams,
  parseHost,
  resolveCorsAllowOrigin,
  safePortalReturnTo,
  serializeFacetsCatalog,
  taxonomyCatalog,
  toSlug,
} from "@nusa/shared";
import {
  type AuthVariables,
  issueToken,
  ownsOrAdmin,
  requireAuth,
  requireRole,
} from "./auth.js";
import {
  isPubliclyListed,
  toPublicBusiness,
  toPublicBusinessCard,
  toPublicNeighbor,
  toPublicReview,
  toPublicVendor,
} from "./public.js";
import {
  LOGIN_EMAIL_MAX,
  LOGIN_MAX,
  LOGIN_WINDOW_MS,
  WRITE_MAX,
  WRITE_WINDOW_MS,
  consume,
  consumeWrite,
  loginEmailKey,
  rateLimit,
  resolveClientIp,
} from "./rate-limit.js";

import {
  assertBookingRequest,
  parseBookingBody,
  parseCategories,
  parseListingPatchBody,
  parseRegisterBody,
  parseReportBody,
  parseReviewBody,
} from "./validate.js";

const app = new Hono<{ Variables: AuthVariables }>();

const CORS_EXTRA = parseCorsOriginAllowlist(process.env.NUSA_CORS_ORIGINS);
const CORS_APEX = (process.env.NUSA_CORS_APEX || "nusa.business").trim();
const CORS_PRODUCTION = process.env.NODE_ENV === "production";

app.onError((error, c) => {
  if (error instanceof BusinessSlugConflictError) {
    return c.json({ error: error.message }, 409);
  }
  console.error(error);
  return c.json({ error: "Internal Server Error" }, 500);
});

/** Uniform 429 so callers cannot tell which limit they hit. */
function tooManyRequests(c: Context, retryAfter: number) {
  c.header("Retry-After", String(retryAfter));
  return c.json({ error: "Too many requests" }, 429);
}

/** In-process booking idempotency (single API process; resets on restart). */
const bookingIdempotency = new Map<string, { bookingId: string; body: unknown }>();
const BOOKING_IDEMPOTENCY_MAX = 5_000;

function rememberBookingIdempotency(key: string, bookingId: string, body: unknown) {
  if (bookingIdempotency.size >= BOOKING_IDEMPOTENCY_MAX) {
    const first = bookingIdempotency.keys().next().value;
    if (first) bookingIdempotency.delete(first);
  }
  bookingIdempotency.set(key, { bookingId, body });
}

app.use(
  "*",
  cors({
    origin: (origin) =>
      resolveCorsAllowOrigin(origin, {
        production: CORS_PRODUCTION,
        extraOrigins: CORS_EXTRA,
        apexHostname: CORS_APEX,
      }) ?? undefined,
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

app.get("/v1/meta/categories", (c) =>
  c.json({
    categories: CATEGORIES,
    taxonomy: taxonomyCatalog(),
    facets: serializeFacetsCatalog(),
  }),
);

app.get("/v1/host", (c) => {
  if (process.env.NODE_ENV === "production") {
    return c.json({ error: "Not found" }, 404);
  }
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
  const businesses = listBusinesses({ islandSlug: island.slug }).map(
    toPublicBusinessCard,
  );
  return c.json({ island, places, businesses });
});

app.get("/v1/islands/:island/places/:place", (c) => {
  const place = getPlace(c.req.param("island"), c.req.param("place"));
  if (!place) return c.json({ error: "Place not found" }, 404);
  const island = getIslandBySlug(c.req.param("island"))!;
  const islandPlaces = listPlaces(island.slug);
  const parent = place.parentPlaceId
    ? islandPlaces.find((p) => p.id === place.parentPlaceId)
    : undefined;
  const children = islandPlaces.filter((p) => p.parentPlaceId === place.id);
  const businesses = listBusinesses({
    islandSlug: island.slug,
    placeSlug: place.slug,
    category: c.req.query("category") || undefined,
    q: c.req.query("q") || undefined,
  }).map(toPublicBusinessCard);
  return c.json({ island, place, parent, children, businesses });
});

app.get("/v1/islands/:island/places/:place/businesses/:slug", (c) => {
  const business = getBusiness(
    c.req.param("island"),
    c.req.param("place"),
    c.req.param("slug"),
  );
  if (!business || !isPubliclyListed(business)) {
    return c.json({ error: "Business not found" }, 404);
  }
  const reviews = listReviews(business.id).map(toPublicReview);
  const vendorRow = getVendorByBusinessId(business.id);
  const vendor = vendorRow ? toPublicVendor(vendorRow) : undefined;
  // Bookings and customer details stay on authenticated owner/admin routes.
  return c.json({
    business: toPublicBusiness(business),
    reviews,
    vendor,
  });
});

app.get("/v1/islands/:island/places/:place/businesses/:slug/discovery", (c) => {
  const business = getBusiness(
    c.req.param("island"),
    c.req.param("place"),
    c.req.param("slug"),
  );
  if (!business || !isPubliclyListed(business)) {
    return c.json({ error: "Business not found" }, 404);
  }
  const radiusRaw = c.req.query("radiusKm");
  const radiusKm = radiusRaw ? Number(radiusRaw) : 2;
  if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 50) {
    return c.json({ error: "radiusKm must be between 0 and 50" }, 400);
  }
  const category = c.req.query("category") || undefined;
  const discovery = getBusinessDiscovery(business.id, { radiusKm, category });
  if (!discovery) return c.json({ error: "Business not found" }, 404);

  const mapNeighbor = (n: (typeof discovery.nearby)[number]) =>
    toPublicNeighbor(n);

  return c.json({
    origin: discovery.origin,
    radiusKm: discovery.radiusKm,
    sameAddress: discovery.sameAddress.map(mapNeighbor),
    similar: discovery.similar.map(mapNeighbor),
    nearbyCategories: discovery.nearbyCategories,
    nearby: discovery.nearby.map(mapNeighbor),
    activeCategory: discovery.activeCategory,
  });
});

app.get("/v1/search", (c) => {
  const url = new URL(c.req.url);
  const q = c.req.query("q") || undefined;
  const island = c.req.query("island") || undefined;
  const place = c.req.query("place") || undefined;
  const category = c.req.query("category") || undefined;
  const facets = parseFacetQueryParams(url.searchParams, category);
  const latRaw = c.req.query("lat");
  const lngRaw = c.req.query("lng");
  const lat = latRaw !== undefined ? Number(latRaw) : NaN;
  const lng = lngRaw !== undefined ? Number(lngRaw) : NaN;
  const origin =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
  const businesses = listBusinesses({
    q,
    islandSlug: island,
    placeSlug: place,
    category,
    facets: Object.keys(facets).length ? facets : undefined,
    origin,
  });
  return c.json({
    results: businesses.map((b) => {
      const ctx = resolveBusinessContext(b.id);
      return {
        business: toPublicBusinessCard(b),
        place: ctx?.place,
        island: ctx?.island,
        geo: ctx?.geo,
      };
    }),
  });
});

app.post(
  "/v1/auth/login",
  rateLimit({ id: "login-ip", limit: LOGIN_MAX, windowMs: LOGIN_WINDOW_MS }),
  async (c) => {
    const body = await c.req.json<{ email: string; password: string }>();
    if (!body?.email || !body?.password) {
      return c.json({ error: "email and password required" }, 400);
    }

    // Second throttle keyed on the account, so rotating source addresses does
    // not give an attacker unlimited attempts against one user. Applied after
    // parsing rather than as middleware so the body is read exactly once.
    const perEmail = consume(
      `login-email:${loginEmailKey(body.email)}`,
      LOGIN_EMAIL_MAX,
      LOGIN_WINDOW_MS,
    );
    if (!perEmail.allowed) {
      c.header("Retry-After", String(perEmail.retryAfter));
      return c.json({ error: "Too many requests" }, 429);
    }

    const user = await authenticate(body.email, body.password);
    if (!user) return c.json({ error: "Invalid credentials" }, 401);
    const { password: _, ...safe } = user;
    return c.json({ user: safe, token: issueToken(user) });
  },
);

/**
 * Owner self-signup (email + name + password) or invite redeem.
 * Clients cannot choose a role. Claim approval is still required before
 * editing an existing listing.
 */
app.post(
  "/v1/auth/register",
  rateLimit({ id: "register-ip", limit: LOGIN_MAX, windowMs: LOGIN_WINDOW_MS }),
  async (c) => {
    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      return c.json({ error: "Malformed JSON" }, 400);
    }
    const parsed = parseRegisterBody(raw);
    if (!parsed.ok) return c.json({ error: parsed.error }, 400);

    if (parsed.value.kind === "invite") {
      const result = await redeemInvite({
        rawToken: parsed.value.token,
        name: parsed.value.name,
        password: parsed.value.password,
      });
      if (!result.ok) return c.json({ error: result.error }, 400);
      const { password: _, ...safe } = result.user;
      const returnTo = result.invite.businessId
        ? `/claim?businessId=${encodeURIComponent(result.invite.businessId)}`
        : parsed.value.returnTo || "/";
      return c.json(
        {
          user: safe,
          token: issueToken(result.user),
          returnTo: safePortalReturnTo(returnTo),
        },
        201,
      );
    }

    const result = await registerOwner({
      email: parsed.value.email,
      name: parsed.value.name,
      password: parsed.value.password,
    });
    if (!result.ok) return c.json({ error: result.error }, 400);
    const { password: _, ...safe } = result.user;
    const returnTo = parsed.value.returnTo || "/listings";
    return c.json(
      {
        user: safe,
        token: issueToken(result.user),
        returnTo: safePortalReturnTo(returnTo),
      },
      201,
    );
  },
);

app.get("/v1/auth/invite/:token", async (c) => {
  const invite = findValidInvite(c.req.param("token"));
  if (!invite) return c.json({ error: "Invalid or expired invitation" }, 404);
  let listing: { id: string; name: string; place?: string; island?: string } | undefined;
  if (invite.businessId) {
    const ctx = resolveBusinessContext(invite.businessId);
    if (ctx) {
      listing = {
        id: ctx.business.id,
        name: ctx.business.name,
        place: ctx.place.name,
        island: ctx.island.name,
      };
    }
  }
  return c.json({
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt,
    listing,
  });
});

/**
 * Password recovery request. Always returns 200 for valid-shaped emails so
 * callers cannot probe account existence. Delivery is operator-mediated at
 * launch (token returned only when NUSA_EXPOSE_RECOVERY_TOKENS=1).
 */
app.post(
  "/v1/auth/recovery/request",
  rateLimit({ id: "recovery-ip", limit: LOGIN_MAX, windowMs: LOGIN_WINDOW_MS }),
  async (c) => {
    let body: { email?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Malformed JSON" }, 400);
    }
    const email = (body.email || "").trim().toLowerCase();
    if (!email.includes("@")) {
      return c.json({ error: "email required" }, 400);
    }
    const perEmail = consume(
      `recovery-email:${loginEmailKey(email)}`,
      LOGIN_EMAIL_MAX,
      LOGIN_WINDOW_MS,
    );
    if (!perEmail.allowed) {
      c.header("Retry-After", String(perEmail.retryAfter));
      return c.json({ error: "Too many requests" }, 429);
    }

    const user = getUserByEmail(email);
    const expose =
      process.env.NUSA_EXPOSE_RECOVERY_TOKENS === "1" ||
      process.env.NODE_ENV !== "production";
    let recoveryToken: string | undefined;
    if (user) {
      const issued = createRecoveryToken(user.id);
      recoveryToken = issued.rawToken;
      console.log(
        `[recovery] token issued for user ${user.id} (email redacted); expose=${expose}`,
      );
    }
    return c.json({
      ok: true,
      delivery: expose ? "response" : "operator",
      message:
        "If an account exists for that email, a recovery link was issued for an operator to deliver.",
      ...(expose && recoveryToken
        ? {
            recoveryToken,
            recoveryPath: `/recovery/confirm?token=${encodeURIComponent(recoveryToken)}`,
          }
        : {}),
    });
  },
);

app.post(
  "/v1/auth/recovery/confirm",
  rateLimit({ id: "recovery-confirm-ip", limit: LOGIN_MAX, windowMs: LOGIN_WINDOW_MS }),
  async (c) => {
    let body: { token?: string; password?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Malformed JSON" }, 400);
    }
    if (!body.token || !body.password) {
      return c.json({ error: "token and password are required" }, 400);
    }
    const result = await consumeRecoveryToken({
      rawToken: body.token,
      newPassword: body.password,
    });
    if (!result.ok) return c.json({ error: result.error }, 400);
    const { password: _, ...safe } = result.user;
    return c.json({ user: safe, token: issueToken(result.user) });
  },
);

app.post("/v1/invites", requireRole("admin"), async (c) => {
  let body: {
    email?: string;
    role?: "owner" | "vendor" | "field_agent" | "admin";
    businessId?: string;
    ttlHours?: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Malformed JSON" }, 400);
  }
  const email = (body.email || "").trim().toLowerCase();
  if (!email.includes("@")) return c.json({ error: "email required" }, 400);
  if (body.businessId && !getBusinessById(body.businessId)) {
    return c.json({ error: "Business not found" }, 404);
  }
  const role = body.role ?? "owner";
  const { invite, rawToken } = createInvite({
    email,
    role,
    createdByUserId: c.get("user").id,
    businessId: body.businessId,
    ttlHours: body.ttlHours,
  });
  return c.json(
    {
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        businessId: invite.businessId,
      },
      // Operator delivers this out-of-band (email/WhatsApp). Not a public secret
      // channel — treat like a password reset link.
      token: rawToken,
      registerPath: `/register?token=${encodeURIComponent(rawToken)}`,
    },
    201,
  );
});

/** Operator-mediated recovery when production does not expose tokens publicly. */
app.post("/v1/admin/recovery-tokens", requireRole("admin"), async (c) => {
  let body: { email?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Malformed JSON" }, 400);
  }
  const user = getUserByEmail(body.email || "");
  if (!user) return c.json({ error: "User not found" }, 404);
  const { rawToken } = createRecoveryToken(user.id);
  return c.json({
    userId: user.id,
    email: user.email,
    recoveryToken: rawToken,
    recoveryPath: `/recovery/confirm?token=${encodeURIComponent(rawToken)}`,
  });
});

app.get("/v1/me", requireAuth, (c) => c.json({ user: c.get("user") }));

/** Claim UI helper: show listing name/place without requiring a raw ID only. */
app.get("/v1/claim-context/:businessId", requireAuth, (c) => {
  const ctx = resolveBusinessContext(c.req.param("businessId"));
  if (!ctx || !isPubliclyListed(ctx.business)) {
    return c.json({ error: "Business not found" }, 404);
  }
  return c.json({
    business: {
      id: ctx.business.id,
      name: ctx.business.name,
      slug: ctx.business.slug,
      status: ctx.business.status,
    },
    place: { name: ctx.place.name, slug: ctx.place.slug },
    island: { name: ctx.island.name, slug: ctx.island.slug },
    returnTo: safePortalReturnTo(
      `/claim?businessId=${encodeURIComponent(ctx.business.id)}`,
    ),
  });
});

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
    if (body.status !== undefined && body.status !== "draft" && body.status !== "published") {
      return c.json({ error: "status must be draft or published; claimed requires claim approval" }, 400);
    }
    const categories = parseCategories(body.categories);
    if (!categories.ok) return c.json({ error: categories.error }, 400);
    const business = createBusiness({
      placeId: body.placeId,
      slug: toSlug(body.name),
      name: body.name,
      summary: body.summary,
      description: body.description,
      categories: categories.value,
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
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Malformed JSON" }, 400);
  }
  const parsed = parseListingPatchBody(raw);
  if (!parsed.ok) return c.json({ error: parsed.error }, 400);
  const updated = upsertBusiness({
    ...existing,
    ...parsed.value,
    // Identity and ownership are not client-editable.
    id: existing.id,
    ownerUserId: existing.ownerUserId,
    registeredByAgentId: existing.registeredByAgentId,
    vendorId: existing.vendorId,
    placeId: existing.placeId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  return c.json({ business: updated });
});

app.post(
  "/v1/claims",
  requireAuth,
  // Keyed on the authenticated account, not the address: this route has a real
  // identity, so there is no reason to punish everyone behind a shared proxy.
  rateLimit({
    id: "claims",
    limit: WRITE_MAX,
    windowMs: WRITE_WINDOW_MS,
    key: (c) => c.get("user").id,
  }),
  async (c) => {
    const user = c.get("user");
    let body: { businessId?: string; note?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Malformed JSON" }, 400);
    }
    if (!body.businessId || typeof body.businessId !== "string") {
      return c.json({ error: "businessId required" }, 400);
    }
    const business = getBusinessById(body.businessId);
    if (!business || !isPubliclyListed(business)) {
      return c.json({ error: "Business not found" }, 404);
    }
    if (body.note && body.note.length > 4000) {
      return c.json({ error: "note is too long (max 4000)" }, 400);
    }
    try {
      // The claimant is always the caller — never taken from the request body.
      const claim = addClaim({
        businessId: business.id,
        claimantUserId: user.id,
        note: body.note?.trim() || undefined,
      });
      return c.json({ claim }, 201);
    } catch (err) {
      if (err instanceof ClaimConflictError) {
        return c.json({ error: err.message }, 409);
      }
      throw err;
    }
  },
);

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
  let body: { status?: "approved" | "rejected"; reason?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Malformed JSON" }, 400);
  }
  if (body.status !== "approved" && body.status !== "rejected") {
    return c.json({ error: "status must be approved or rejected" }, 400);
  }
  if (body.reason && body.reason.length > 2000) {
    return c.json({ error: "reason is too long (max 2000)" }, 400);
  }
  const result = decideClaim(c.req.param("id"), {
    status: body.status,
    actorUserId: c.get("user").id,
    reason: body.reason,
  });
  if (!result.ok) {
    const status = result.code === "not_found" ? 404 : 409;
    return c.json({ error: result.error }, status);
  }
  return c.json({ claim: result.claim });
});

app.post(
  "/v1/businesses/:id/reviews",
  async (c) => {
    // Verified before limiting: an unchecked id would both create orphan
    // reviews and let an attacker mint unlimited distinct rate-limit keys.
    const business = getBusinessById(c.req.param("id"));
    if (!business || !isPubliclyListed(business)) {
      return c.json({ error: "Not found" }, 404);
    }

    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      return c.json({ error: "Malformed JSON" }, 400);
    }
    const parsed = parseReviewBody(raw);
    if (!parsed.ok) return c.json({ error: parsed.error }, 400);

    const limited = consumeWrite("reviews", resolveClientIp(c), business.id);
    if (!limited.allowed) return tooManyRequests(c, limited.retryAfter);

    const review = addReview({ ...parsed.value, businessId: business.id });
    return c.json({ review: toPublicReview(review) }, 201);
  },
);

app.post(
  "/v1/businesses/:id/bookings",
  async (c) => {
    const business = getBusinessById(c.req.param("id"));
    if (!business || !isPubliclyListed(business)) {
      return c.json({ error: "Not found" }, 404);
    }

    // Booking-disabled is checked first: a request refused for that reason
    // never touched the booking resource, and the owner can enable booking
    // mid-window — charging it would leave real customers blocked afterwards.
    if (business.bookingMode === "none") {
      return c.json({ error: "Booking not enabled", code: "BOOKING_NOT_ENABLED" }, 400);
    }

    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      return c.json({ error: "Malformed JSON" }, 400);
    }
    const parsed = parseBookingBody(raw);
    if (!parsed.ok) {
      return c.json(
        parsed.code
          ? { error: parsed.error, code: parsed.code }
          : { error: parsed.error },
        400,
      );
    }
    const scheduled = assertBookingRequest(business.bookingMode, parsed.value);
    if (!scheduled.ok) {
      return c.json(
        scheduled.code
          ? { error: scheduled.error, code: scheduled.code }
          : { error: scheduled.error },
        400,
      );
    }

    const idemKey = (c.req.header("idempotency-key") || "").trim();
    if (idemKey.length > 128) {
      return c.json({ error: "Idempotency key is too long (max 128)" }, 400);
    }
    if (idemKey) {
      const prior = bookingIdempotency.get(`${business.id}:${idemKey}`);
      if (prior) {
        // parseBookingBody emits fields in a fixed order and normalizes optional values.
        if (JSON.stringify(prior.body) !== JSON.stringify(parsed.value)) {
          return c.json({ error: "Idempotency key already used for a different request" }, 409);
        }
        const existing = listBookings(business.id).find((b) => b.id === prior.bookingId);
        if (existing) {
          return c.json({ ok: true, idempotentReplay: true }, 200);
        }
      }
    }

    const duplicate = findDuplicatePendingBooking({
      businessId: business.id,
      customerEmail: scheduled.value.customerEmail,
      startDate: scheduled.value.startDate,
      endDate: scheduled.value.endDate,
      timeSlot: scheduled.value.timeSlot,
    });
    if (duplicate) {
      return c.json(
        {
          error: "A pending request already exists for these dates",
          code: "BOOKING_DUPLICATE",
        },
        409,
      );
    }

    const limited = consumeWrite("bookings", resolveClientIp(c), business.id);
    if (!limited.allowed) return tooManyRequests(c, limited.retryAfter);

    const booking = addBooking({
      businessId: business.id,
      mode: business.bookingMode,
      customerName: parsed.value.customerName,
      customerEmail: parsed.value.customerEmail,
      customerPhone: parsed.value.customerPhone,
      startDate: parsed.value.startDate,
      endDate: parsed.value.endDate,
      timeSlot: parsed.value.timeSlot,
      guests: parsed.value.guests,
      tickets: parsed.value.tickets,
      notes: parsed.value.notes,
      // Request-only launch: ignore client amounts; not a verified price.
      totalAmount: 0,
      currency: "IDR",
    });
    if (idemKey) {
      rememberBookingIdempotency(`${business.id}:${idemKey}`, booking.id, parsed.value);
    }
    return c.json({ ok: true }, 201);
  },
);

app.post(
  "/v1/businesses/:id/reports",
  async (c) => {
    const business = getBusinessById(c.req.param("id"));
    if (!business || !isPubliclyListed(business)) {
      return c.json({ error: "Not found" }, 404);
    }
    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      return c.json({ error: "Malformed JSON" }, 400);
    }
    const parsed = parseReportBody(raw);
    if (!parsed.ok) return c.json({ error: parsed.error }, 400);
    const limited = consumeWrite("reports", resolveClientIp(c), business.id);
    if (!limited.allowed) return tooManyRequests(c, limited.retryAfter);
    const report = addListingReport({
      businessId: business.id,
      kind: parsed.value.kind,
      note: parsed.value.note,
    });
    return c.json(
      {
        report: { id: report.id, kind: report.kind, createdAt: report.createdAt },
        message: "Report received. Operators will review it.",
      },
      201,
    );
  },
);

app.get("/v1/reports", requireRole("admin"), (c) => {
  const businessId = c.req.query("businessId") || undefined;
  return c.json({ reports: listListingReports(businessId) });
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
app.post(
  "/v1/field/register",
  requireRole("field_agent", "admin"),
  async (c) => {
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
    const categories = parseCategories(body.categories);
    if (!categories.ok) return c.json({ error: categories.error }, 400);

    const business = createBusiness({
      placeId: place.id,
      slug: toSlug(body.name),
      name: body.name,
      summary: body.summary,
      description: body.description || body.summary,
      categories: categories.value,
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
  },
);

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
      business: toPublicBusinessCard(b),
      context: resolveBusinessContext(b.id),
    })),
  });
});

/** multi-vendor marketplace endpoints (OSS stub ready for Mercur link) */
app.get("/v1/marketplace/vendors/:id", (c) => {
  const vendor = getVendorById(c.req.param("id"));
  if (!vendor) return c.json({ error: "Vendor not found" }, 404);
  const business = getBusinessById(vendor.businessId);
  if (!business || !isPubliclyListed(business)) {
    return c.json({ error: "Vendor not found" }, 404);
  }
  return c.json({
    vendor: toPublicVendor(vendor),
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

export { app };
