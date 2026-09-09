import { canonicalizeCategoryList, canonicalizeFacetMap } from "@nusa/shared";

export type ValidationOk<T> = { ok: true; value: T };
export type ValidationErr = { ok: false; error: string };
export type ValidationResult<T> = ValidationOk<T> | ValidationErr;

const BOOKING_MODES = new Set(["none", "service", "rental", "event"]);

const SAFE_URL = /^(https?:)\/\//i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function fail(error: string): ValidationErr {
  return { ok: false, error };
}

export function parseCategories(raw: unknown): ValidationResult<string[]> {
  if (!Array.isArray(raw) || raw.length === 0) {
    return fail("categories must be a non-empty array");
  }
  if (raw.length > 12) return fail("categories: too many (max 12)");
  const asStrings: string[] = [];
  for (const c of raw) {
    if (typeof c !== "string") {
      return fail(`categories contains unknown value: ${String(c)}`);
    }
    asStrings.push(c);
  }
  const canonical = canonicalizeCategoryList(asStrings);
  if (!canonical.ok) return fail(canonical.error);
  return { ok: true, value: canonical.value };
}

function asObject(body: unknown): ValidationResult<Record<string, unknown>> {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return fail("JSON body must be an object");
  }
  return { ok: true, value: body as Record<string, unknown> };
}

function requireString(
  row: Record<string, unknown>,
  key: string,
  opts: { max: number; min?: number } = { max: 500 },
): ValidationResult<string> {
  const raw = row[key];
  if (typeof raw !== "string") return fail(`${key} must be a string`);
  const value = raw.trim();
  const min = opts.min ?? 1;
  if (value.length < min) return fail(`${key} is required`);
  if (value.length > opts.max) return fail(`${key} is too long (max ${opts.max})`);
  return { ok: true, value };
}

function optionalString(
  row: Record<string, unknown>,
  key: string,
  opts: { max: number } = { max: 500 },
): ValidationResult<string | undefined> {
  if (row[key] === undefined || row[key] === null || row[key] === "") {
    return { ok: true, value: undefined };
  }
  return requireString(row, key, { max: opts.max, min: 1 });
}

function scoreField(
  row: Record<string, unknown>,
  key: string,
): ValidationResult<number> {
  const raw = row[key];
  if (typeof raw !== "number" || !Number.isFinite(raw) || !Number.isInteger(raw)) {
    return fail(`${key} must be an integer from 1 to 5`);
  }
  if (raw < 1 || raw > 5) return fail(`${key} must be an integer from 1 to 5`);
  return { ok: true, value: raw };
}

function optionalFiniteNumber(
  row: Record<string, unknown>,
  key: string,
  opts: { min?: number; max?: number; integer?: boolean } = {},
): ValidationResult<number | undefined> {
  if (row[key] === undefined || row[key] === null || row[key] === "") {
    return { ok: true, value: undefined };
  }
  const raw = row[key];
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return fail(`${key} must be a finite number`);
  }
  if (opts.integer && !Number.isInteger(raw)) {
    return fail(`${key} must be an integer`);
  }
  if (opts.min !== undefined && raw < opts.min) {
    return fail(`${key} must be ≥ ${opts.min}`);
  }
  if (opts.max !== undefined && raw > opts.max) {
    return fail(`${key} must be ≤ ${opts.max}`);
  }
  return { ok: true, value: raw };
}

function optionalEmail(
  row: Record<string, unknown>,
  key: string,
): ValidationResult<string | undefined> {
  const s = optionalString(row, key, { max: 254 });
  if (!s.ok) return s;
  if (!s.value) return s;
  if (!EMAIL_RE.test(s.value)) return fail(`${key} must be a valid email`);
  return s;
}

function requireEmail(
  row: Record<string, unknown>,
  key: string,
): ValidationResult<string> {
  const s = requireString(row, key, { max: 254 });
  if (!s.ok) return s;
  if (!EMAIL_RE.test(s.value)) return fail(`${key} must be a valid email`);
  return s;
}

function optionalSafeUrl(
  row: Record<string, unknown>,
  key: string,
): ValidationResult<string | undefined> {
  const s = optionalString(row, key, { max: 2000 });
  if (!s.ok) return s;
  if (!s.value) return s;
  if (!SAFE_URL.test(s.value)) {
    return fail(`${key} must start with http:// or https://`);
  }
  try {
    void new URL(s.value);
  } catch {
    return fail(`${key} must be a valid URL`);
  }
  return s;
}

function requireIsoDate(
  row: Record<string, unknown>,
  key: string,
): ValidationResult<string> {
  const s = requireString(row, key, { max: 32 });
  if (!s.ok) return s;
  if (!ISO_DATE_RE.test(s.value)) {
    return fail(`${key} must be an ISO date (YYYY-MM-DD)`);
  }
  const t = Date.parse(`${s.value}T00:00:00.000Z`);
  if (!Number.isFinite(t) || new Date(t).toISOString().slice(0, 10) !== s.value) {
    return fail(`${key} must be a valid date`);
  }
  return s;
}

function optionalIsoDate(
  row: Record<string, unknown>,
  key: string,
): ValidationResult<string | undefined> {
  if (row[key] === undefined || row[key] === null || row[key] === "") {
    return { ok: true, value: undefined };
  }
  return requireIsoDate(row, key);
}

export type PublicReviewInput = {
  authorName: string;
  authorEmail?: string;
  service: number;
  value: number;
  location: number;
  cleanliness: number;
  comment: string;
};

export function parseReviewBody(body: unknown): ValidationResult<PublicReviewInput> {
  const obj = asObject(body);
  if (!obj.ok) return obj;
  const row = obj.value;
  const authorName = requireString(row, "authorName", { max: 120 });
  if (!authorName.ok) return authorName;
  const authorEmail = optionalEmail(row, "authorEmail");
  if (!authorEmail.ok) return authorEmail;
  const comment = requireString(row, "comment", { max: 4000 });
  if (!comment.ok) return comment;
  const service = scoreField(row, "service");
  if (!service.ok) return service;
  const value = scoreField(row, "value");
  if (!value.ok) return value;
  const location = scoreField(row, "location");
  if (!location.ok) return location;
  const cleanliness = scoreField(row, "cleanliness");
  if (!cleanliness.ok) return cleanliness;
  return {
    ok: true,
    value: {
      authorName: authorName.value,
      authorEmail: authorEmail.value,
      comment: comment.value,
      service: service.value,
      value: value.value,
      location: location.value,
      cleanliness: cleanliness.value,
    },
  };
}

export type PublicBookingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startDate: string;
  endDate?: string;
  timeSlot?: string;
  guests?: number;
  tickets?: number;
  notes?: string;
};

/**
 * Request-only bookings: client-supplied amounts are ignored. Mode, dates, and
 * quantities are checked in assertBookingRequest; there is no priced inventory
 * hold at launch.
 */
export function parseBookingBody(body: unknown): ValidationResult<PublicBookingInput> {
  const obj = asObject(body);
  if (!obj.ok) return obj;
  const row = obj.value;
  const customerName = requireString(row, "customerName", { max: 120 });
  if (!customerName.ok) return customerName;
  const customerEmail = requireEmail(row, "customerEmail");
  if (!customerEmail.ok) return customerEmail;
  const customerPhone = optionalString(row, "customerPhone", { max: 40 });
  if (!customerPhone.ok) return customerPhone;
  const startDate = requireIsoDate(row, "startDate");
  if (!startDate.ok) return startDate;
  const endDate = optionalIsoDate(row, "endDate");
  if (!endDate.ok) return endDate;
  if (endDate.value && endDate.value < startDate.value) {
    return fail("endDate must be on or after startDate");
  }
  const timeSlot = optionalString(row, "timeSlot", { max: 40 });
  if (!timeSlot.ok) return timeSlot;
  const guests = optionalFiniteNumber(row, "guests", {
    min: 1,
    max: 10_000,
    integer: true,
  });
  if (!guests.ok) return guests;
  const tickets = optionalFiniteNumber(row, "tickets", {
    min: 1,
    max: 10_000,
    integer: true,
  });
  if (!tickets.ok) return tickets;
  const notes = optionalString(row, "notes", { max: 2000 });
  if (!notes.ok) return notes;
  return {
    ok: true,
    value: {
      customerName: customerName.value,
      customerEmail: customerEmail.value,
      customerPhone: customerPhone.value,
      startDate: startDate.value,
      endDate: endDate.value,
      timeSlot: timeSlot.value,
      guests: guests.value,
      tickets: tickets.value,
      notes: notes.value,
    },
  };
}

export function utcToday(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Mode-specific booking rules after the body is structurally valid.
 * Inventory calendars are not modelled yet — this rejects past dates,
 * missing rental/event fields, and booking-disabled listings.
 */
export function assertBookingRequest(
  mode: string,
  input: PublicBookingInput,
  opts: { today?: string } = {},
): ValidationResult<PublicBookingInput> {
  if (mode !== "service" && mode !== "rental" && mode !== "event") {
    return fail("Booking not enabled");
  }
  const today = opts.today ?? utcToday();
  if (input.startDate < today) {
    return fail("startDate must be today or later");
  }
  if (mode === "rental" && !input.endDate) {
    return fail("endDate is required for rentals");
  }
  if (mode === "event" && input.tickets === undefined) {
    return fail("tickets is required for events");
  }
  return { ok: true, value: input };
}

export type PublicReportInput = {
  kind: "correction" | "abuse";
  note: string;
};

export type RegisterInviteInput = {
  kind: "invite";
  token: string;
  name: string;
  password: string;
  returnTo?: string;
};

export type RegisterOwnerInput = {
  kind: "owner";
  email: string;
  name: string;
  password: string;
  returnTo?: string;
};

export type RegisterInput = RegisterInviteInput | RegisterOwnerInput;

/** Invite redeem (any invited role) or public owner self-signup. */
export function parseRegisterBody(body: unknown): ValidationResult<RegisterInput> {
  const obj = asObject(body);
  if (!obj.ok) return obj;
  const row = obj.value;
  if (row.role !== undefined) {
    return fail("role cannot be set by the client");
  }
  const name = requireString(row, "name", { max: 120 });
  if (!name.ok) return name;
  const password = requireString(row, "password", { max: 200, min: 12 });
  if (!password.ok) return password;
  const returnTo = optionalString(row, "returnTo", { max: 500 });
  if (!returnTo.ok) return returnTo;
  const token = optionalString(row, "token", { max: 200 });
  if (!token.ok) return token;
  if (token.value) {
    return {
      ok: true,
      value: {
        kind: "invite",
        token: token.value,
        name: name.value,
        password: password.value,
        returnTo: returnTo.value,
      },
    };
  }
  const email = requireEmail(row, "email");
  if (!email.ok) return email;
  return {
    ok: true,
    value: {
      kind: "owner",
      email: email.value,
      name: name.value,
      password: password.value,
      returnTo: returnTo.value,
    },
  };
}

export function parseReportBody(body: unknown): ValidationResult<PublicReportInput> {
  const obj = asObject(body);
  if (!obj.ok) return obj;
  const row = obj.value;
  const kindRaw = row.kind;
  if (kindRaw !== "correction" && kindRaw !== "abuse") {
    return fail("kind must be correction or abuse");
  }
  const note = requireString(row, "note", { max: 2000, min: 12 });
  if (!note.ok) return note;
  return { ok: true, value: { kind: kindRaw, note: note.value } };
}

/** Fields owners may PATCH. Identity, ownership, verification stay server-controlled. */
const LISTING_PATCH_ALLOW = new Set([
  "name",
  "summary",
  "description",
  "categories",
  "address",
  "phone",
  "whatsapp",
  "website",
  "lat",
  "lng",
  "gallery",
  "videoUrl",
  "social",
  "openingHours",
  "faq",
  "bookingMode",
  "slug",
  "facets",
]);

export type ListingPatchInput = {
  name?: string;
  summary?: string;
  description?: string;
  categories?: string[];
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  lat?: number;
  lng?: number;
  gallery?: string[];
  videoUrl?: string;
  social?: Record<string, string>;
  openingHours?: { day: string; open: string; close: string; closed?: boolean }[];
  faq?: { q: string; a: string }[];
  bookingMode?: "none" | "service" | "rental" | "event";
  slug?: string;
  facets?: Record<string, string[]>;
};

export function parseListingPatchBody(
  body: unknown,
): ValidationResult<ListingPatchInput> {
  const obj = asObject(body);
  if (!obj.ok) return obj;
  const row = obj.value;
  for (const key of Object.keys(row)) {
    if (!LISTING_PATCH_ALLOW.has(key)) {
      return fail(`Field not allowed: ${key}`);
    }
  }
  const out: ListingPatchInput = {};

  if ("name" in row) {
    const v = requireString(row, "name", { max: 200 });
    if (!v.ok) return v;
    out.name = v.value;
  }
  if ("summary" in row) {
    const v = requireString(row, "summary", { max: 500 });
    if (!v.ok) return v;
    out.summary = v.value;
  }
  if ("description" in row) {
    const v = requireString(row, "description", { max: 20_000 });
    if (!v.ok) return v;
    out.description = v.value;
  }
  if ("slug" in row) {
    const v = requireString(row, "slug", { max: 120 });
    if (!v.ok) return v;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.value)) {
      return fail("slug must be lowercase kebab-case");
    }
    out.slug = v.value;
  }
  if ("address" in row) {
    const v = optionalString(row, "address", { max: 500 });
    if (!v.ok) return v;
    out.address = v.value;
  }
  if ("phone" in row) {
    const v = optionalString(row, "phone", { max: 40 });
    if (!v.ok) return v;
    out.phone = v.value;
  }
  if ("whatsapp" in row) {
    const v = optionalString(row, "whatsapp", { max: 40 });
    if (!v.ok) return v;
    out.whatsapp = v.value;
  }
  if ("website" in row) {
    const v = optionalSafeUrl(row, "website");
    if (!v.ok) return v;
    out.website = v.value;
  }
  if ("videoUrl" in row) {
    const v = optionalSafeUrl(row, "videoUrl");
    if (!v.ok) return v;
    out.videoUrl = v.value;
  }
  if ("lat" in row) {
    const v = optionalFiniteNumber(row, "lat", { min: -90, max: 90 });
    if (!v.ok) return v;
    out.lat = v.value;
  }
  if ("lng" in row) {
    const v = optionalFiniteNumber(row, "lng", { min: -180, max: 180 });
    if (!v.ok) return v;
    out.lng = v.value;
  }
  if ("bookingMode" in row) {
    const raw = row.bookingMode;
    if (typeof raw !== "string" || !BOOKING_MODES.has(raw)) {
      return fail("bookingMode must be none|service|rental|event");
    }
    out.bookingMode = raw as ListingPatchInput["bookingMode"];
  }
  if ("categories" in row) {
    const parsed = parseCategories(row.categories);
    if (!parsed.ok) return parsed;
    out.categories = parsed.value;
  }
  if ("gallery" in row) {
    const raw = row.gallery;
    if (!Array.isArray(raw)) return fail("gallery must be an array");
    if (raw.length > 30) return fail("gallery: too many items (max 30)");
    for (const item of raw) {
      if (typeof item !== "string" || item.length > 2000 || !SAFE_URL.test(item)) {
        return fail("gallery items must be http(s) URLs");
      }
    }
    out.gallery = raw as string[];
  }
  if ("social" in row) {
    const raw = row.social;
    if (raw === undefined || raw === null) {
      out.social = undefined;
    } else if (typeof raw !== "object" || Array.isArray(raw)) {
      return fail("social must be an object");
    } else {
      const social: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof v !== "string" || v.length > 500) {
          return fail(`social.${k} must be a short string`);
        }
        social[k] = v;
      }
      out.social = social;
    }
  }
  if ("openingHours" in row) {
    const raw = row.openingHours;
    if (!Array.isArray(raw)) return fail("openingHours must be an array");
    if (raw.length > 14) return fail("openingHours: too many rows");
    const hours: ListingPatchInput["openingHours"] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") return fail("openingHours row invalid");
      const r = item as Record<string, unknown>;
      if (typeof r.day !== "string" || typeof r.open !== "string" || typeof r.close !== "string") {
        return fail("openingHours rows need day, open, close");
      }
      hours.push({
        day: r.day,
        open: r.open,
        close: r.close,
        closed: r.closed === true,
      });
    }
    out.openingHours = hours;
  }
  if ("faq" in row) {
    const raw = row.faq;
    if (!Array.isArray(raw)) return fail("faq must be an array");
    if (raw.length > 40) return fail("faq: too many items");
    const faq: ListingPatchInput["faq"] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") return fail("faq item invalid");
      const r = item as Record<string, unknown>;
      if (typeof r.q !== "string" || typeof r.a !== "string") {
        return fail("faq items need q and a strings");
      }
      if (r.q.length > 500 || r.a.length > 4000) return fail("faq item too long");
      faq.push({ q: r.q, a: r.a });
    }
    out.faq = faq;
  }
  if ("facets" in row) {
    const rawFacets = row.facets;
    if (rawFacets === undefined || rawFacets === null) {
      out.facets = {};
    } else if (typeof rawFacets !== "object" || Array.isArray(rawFacets)) {
      return fail("facets must be an object of string arrays");
    } else {
      const parsed = canonicalizeFacetMap(rawFacets as Record<string, unknown>);
      if (!parsed.ok) return fail(parsed.error);
      out.facets = parsed.value;
    }
  }

  return { ok: true, value: out };
}
