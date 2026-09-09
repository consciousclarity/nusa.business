import {
  isKnownCategory,
  listingMatchesCategory,
  taxonomyCatalog,
} from "./taxonomy.js";
import { haversineKm } from "./geo.js";
import {
  canonicalizeFacetValue,
  INDEXABLE_FACET_PATHS,
  facetsForListingCategory,
  isIndexableFacetPath,
  isKnownFacetKey,
  knownFacetKeys,
  slugifyFacet,
} from "./facets.js";

export type FacetSelection = Record<string, string[]>;

export type FacetBrowse = {
  category: string;
  /** Path pair — at most one for an indexable URL. */
  pathFacet?: { key: string; value: string };
  /** Extra (or all) selected facets including the path pair. */
  selected: FacetSelection;
};

export type FacetIndexPolicy = {
  index: boolean;
  /** Path with no extra query, used as rel=canonical. */
  canonicalKind: "category" | "facet-path" | "none";
  reason: string;
};

const DISTANCE_KM: Record<string, number> = {
  "1km": 1,
  "5km": 5,
  "10km": 10,
  "25km": 25,
  "50km": 50,
};

/** `/c/{category}` or `/c/{category}/{facet}/{value}` */
export function parseFacetPath(
  segments: string[],
): { ok: true; browse: FacetBrowse } | { ok: false; error: string } {
  const parts = segments.map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 1 && parts.length !== 3) {
    return { ok: false, error: "facet path must be /c/{category} or /c/{category}/{facet}/{value}" };
  }
  const category = parts[0]!;
  if (!isKnownCategory(category)) {
    return { ok: false, error: `unknown category: ${category}` };
  }
  const selected: FacetSelection = {};
  if (parts.length === 1) {
    return { ok: true, browse: { category, selected } };
  }
  const key = parts[1]!;
  const rawVal = parts[2]!;
  if (!isKnownFacetKey(key)) {
    return { ok: false, error: `unknown facet: ${key}` };
  }
  const value = canonicalizeFacetValue(key, rawVal);
  if (!value) {
    return { ok: false, error: `unknown value for ${key}: ${rawVal}` };
  }
  selected[key] = [value];
  return {
    ok: true,
    browse: { category, pathFacet: { key, value }, selected },
  };
}

/** Merge query-string facet params into a browse state. */
export function applyFacetQuery(
  browse: FacetBrowse,
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): FacetBrowse {
  const getAll = (key: string): string[] => {
    if (params instanceof URLSearchParams) {
      return params.getAll(key);
    }
    const raw = params[key];
    if (raw === undefined) return [];
    return Array.isArray(raw) ? raw : [raw];
  };
  const selected: FacetSelection = { ...browse.selected };
  const allowedKeys = new Set(
    facetsForListingCategory(browse.category).map((f) => f.key),
  );
  allowedKeys.add("distance");
  allowedKeys.add("availability");
  allowedKeys.add("rating");
  allowedKeys.add("verification");
  for (const key of allowedKeys) {
    const incoming = getAll(key);
    if (!incoming.length) continue;
    const slugs: string[] = [];
    for (const raw of incoming) {
      const slug =
        canonicalizeFacetValue(key, raw) ??
        (key === "distance" ? DISTANCE_KM[slugifyFacet(raw)] !== undefined
          ? slugifyFacet(raw)
          : undefined
          : undefined);
      if (slug && !slugs.includes(slug)) slugs.push(slug);
    }
    if (slugs.length) {
      const existing = selected[key] ?? [];
      selected[key] = [...new Set([...existing, ...slugs])];
    }
  }
  return { ...browse, selected };
}

export function extraQueryFacetCount(browse: FacetBrowse): number {
  let extra = 0;
  for (const [key, values] of Object.entries(browse.selected)) {
    if (!values.length) continue;
    if (browse.pathFacet && key === browse.pathFacet.key) {
      if (values.some((v) => v !== browse.pathFacet!.value)) extra += 1;
      continue;
    }
    extra += 1;
  }
  return extra;
}

export function facetIndexPolicy(
  browse: FacetBrowse,
  opts: { resultCount: number },
): FacetIndexPolicy {
  if (opts.resultCount < 1) {
    return {
      index: false,
      canonicalKind: browse.pathFacet ? "facet-path" : "category",
      reason: "empty result set",
    };
  }
  const extra = extraQueryFacetCount(browse);
  if (browse.pathFacet) {
    if (
      !isIndexableFacetPath(
        browse.category,
        browse.pathFacet.key,
        browse.pathFacet.value,
      )
    ) {
      return {
        index: false,
        canonicalKind: "category",
        reason: "facet path is not on the index allowlist",
      };
    }
    if (extra > 0) {
      return {
        index: false,
        canonicalKind: "facet-path",
        reason: "additional query facets",
      };
    }
    return { index: true, canonicalKind: "facet-path", reason: "allowlisted facet path" };
  }
  if (extra > 0) {
    return {
      index: false,
      canonicalKind: "category",
      reason: "query-string facets",
    };
  }
  return { index: true, canonicalKind: "category", reason: "category browse" };
}

export function facetPathSegments(browse: FacetBrowse): string[] {
  if (browse.pathFacet && extraQueryFacetCount(browse) === 0) {
    return ["c", browse.category, browse.pathFacet.key, browse.pathFacet.value];
  }
  return ["c", browse.category];
}

export function facetQueryParams(browse: FacetBrowse): URLSearchParams {
  const q = new URLSearchParams();
  for (const [key, values] of Object.entries(browse.selected)) {
    if (browse.pathFacet && key === browse.pathFacet.key && extraQueryFacetCount(browse) === 0) {
      continue;
    }
    if (
      browse.pathFacet &&
      key === browse.pathFacet.key &&
      values.length === 1 &&
      values[0] === browse.pathFacet.value &&
      extraQueryFacetCount(browse) > 0
    ) {
      // Path already expresses this pair; still add extras of other keys only.
      continue;
    }
    const skipPathValue =
      browse.pathFacet && key === browse.pathFacet.key
        ? browse.pathFacet.value
        : undefined;
    for (const v of values) {
      if (v === skipPathValue && extraQueryFacetCount(browse) === 0) continue;
      if (v === skipPathValue) continue;
      q.append(key, v);
    }
  }
  return q;
}

/** Promote a single allowlisted query pair onto the path (301 target). */
export function promoteIndexablePath(browse: FacetBrowse): FacetBrowse | null {
  if (browse.pathFacet) return null;
  const keys = Object.keys(browse.selected).filter(
    (k) => (browse.selected[k]?.length ?? 0) > 0,
  );
  if (keys.length !== 1) return null;
  const key = keys[0]!;
  const values = browse.selected[key]!;
  if (values.length !== 1) return null;
  const value = values[0]!;
  if (!isIndexableFacetPath(browse.category, key, value)) return null;
  return {
    category: browse.category,
    pathFacet: { key, value },
    selected: { [key]: [value] },
  };
}

export type FacetMatchContext = {
  facets?: Record<string, string[]>;
  status?: string;
  openingHours?: { day: string; open: string; close: string; closed?: boolean }[];
  ratingAverage?: number | null;
  lat?: number;
  lng?: number;
  origin?: { lat: number; lng: number };
  now?: Date;
};

const OPEN_LATE_HOUR = 22;

function hourMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function isOpenAt(
  hours: FacetMatchContext["openingHours"],
  now: Date,
): boolean {
  if (!hours?.length) return false;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[now.getDay()];
  const row = hours.find((h) => h.day === day);
  if (!row || row.closed) return false;
  const t = now.getHours() * 60 + now.getMinutes();
  const open = hourMinutes(row.open);
  const close = hourMinutes(row.close);
  if (open === null || close === null) return false;
  if (close < open) return t >= open || t <= close;
  return t >= open && t <= close;
}

function hasOpenLate(hours: FacetMatchContext["openingHours"]): boolean {
  return (hours ?? []).some((h) => {
    if (h.closed) return false;
    const close = hourMinutes(h.close);
    return close !== null && close >= OPEN_LATE_HOUR * 60;
  });
}

function isTwentyFourHours(
  ctx: FacetMatchContext,
  stored: string[] | undefined,
): boolean {
  if (stored?.includes("24-hours")) return true;
  const hours = ctx.openingHours ?? [];
  if (hours.length < 7) return false;
  return hours.every((h) => {
    if (h.closed) return false;
    const open = hourMinutes(h.open);
    const close = hourMinutes(h.close);
    return open === 0 && (close === 24 * 60 || close === 0 || h.close === "24:00");
  });
}

function weekendOpen(hours: FacetMatchContext["openingHours"]): boolean {
  const sat = hours?.find((h) => h.day === "Sat");
  const sun = hours?.find((h) => h.day === "Sun");
  return Boolean(sat && !sat.closed && sun && !sun.closed);
}

function matchesComputed(
  key: string,
  want: string[],
  ctx: FacetMatchContext,
  stored: string[] | undefined,
): boolean {
  if (key === "distance") {
    if (!ctx.origin || typeof ctx.lat !== "number" || typeof ctx.lng !== "number") {
      return false;
    }
    const km = haversineKm(ctx.origin.lat, ctx.origin.lng, ctx.lat, ctx.lng);
    return want.some((v) => {
      const cap = DISTANCE_KM[v];
      return cap !== undefined && km <= cap;
    });
  }
  if (key === "rating") {
    const avg = ctx.ratingAverage;
    if (avg == null) return false;
    return want.some((v) => {
      if (v === "3-plus") return avg >= 3;
      if (v === "4-plus") return avg >= 4;
      if (v === "4-5-plus") return avg >= 4.5;
      return false;
    });
  }
  if (key === "verification") {
    return want.some((v) => {
      if (v === "claimed-listing") return ctx.status === "claimed";
      return stored?.includes(v) ?? false;
    });
  }
  if (key === "availability") {
    const now = ctx.now ?? new Date();
    return want.some((v) => {
      if (v === "open-now") return isOpenAt(ctx.openingHours, now);
      if (v === "open-late") return hasOpenLate(ctx.openingHours);
      if (v === "24-hours") return isTwentyFourHours(ctx, stored);
      if (v === "weekends") return weekendOpen(ctx.openingHours);
      if (v === "public-holidays") return stored?.includes("public-holidays") ?? false;
      return stored?.includes(v) ?? false;
    });
  }
  return false;
}

export function listingMatchesFacets(
  ctx: FacetMatchContext,
  selected: FacetSelection,
): boolean {
  for (const [key, want] of Object.entries(selected)) {
    if (!want.length) continue;
    const stored = ctx.facets?.[key];
    const defSourceComputed = ["distance", "rating", "verification", "availability"].includes(
      key,
    );
    if (defSourceComputed) {
      if (!matchesComputed(key, want, ctx, stored)) return false;
      continue;
    }
    const have = new Set(stored ?? []);
    if (!want.some((v) => have.has(v))) return false;
  }
  return true;
}

function readParamList(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key);
  const raw = params[key];
  if (raw === undefined) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/** Parse facet query params without requiring a browse path. */
export function parseFacetQueryParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  category?: string,
): FacetSelection {
  const allowed = new Set(
    category && isKnownCategory(category)
      ? facetsForListingCategory(category).map((f) => f.key)
      : knownFacetKeys(),
  );
  allowed.add("distance");
  allowed.add("availability");
  allowed.add("rating");
  allowed.add("verification");
  const selected: FacetSelection = {};
  for (const key of allowed) {
    const slugs: string[] = [];
    for (const raw of readParamList(params, key)) {
      const slug =
        canonicalizeFacetValue(key, raw) ??
        (key === "distance" && DISTANCE_KM[slugifyFacet(raw)] !== undefined
          ? slugifyFacet(raw)
          : undefined);
      if (slug && !slugs.includes(slug)) slugs.push(slug);
    }
    if (slugs.length) selected[key] = slugs;
  }
  return selected;
}

export type IndexableBrowsePath = {
  category: string;
  facet?: string;
  facetValue?: string;
};

/**
 * Category and allowlisted facet paths that have at least one matching listing.
 * Used by the sitemap so we never emit thin combinatorial URLs.
 */
export function indexableBrowsePathsForListings(
  listings: Array<{
    categories: string[];
    facets?: Record<string, string[]>;
    status?: string;
    openingHours?: FacetMatchContext["openingHours"];
  }>,
): IndexableBrowsePath[] {
  const out: IndexableBrowsePath[] = [];
  const seen = new Set<string>();
  const push = (row: IndexableBrowsePath) => {
    const key = [row.category, row.facet ?? "", row.facetValue ?? ""].join("/");
    if (seen.has(key)) return;
    seen.add(key);
    out.push(row);
  };

  const catalog = taxonomyCatalog();
  const slugs = [
    ...catalog.flatMap((g) => [g.slug, ...g.children.map((c) => c.slug)]),
  ];

  for (const category of slugs) {
    const inCategory = listings.filter((b) =>
      listingMatchesCategory(b.categories, category),
    );
    if (!inCategory.length) continue;
    push({ category });
    for (const rule of INDEXABLE_FACET_PATHS) {
      if (!rule.categories.includes(category)) continue;
      for (const value of rule.values) {
        const selected = { [rule.facet]: [value] };
        const hits = inCategory.filter((b) =>
          listingMatchesFacets(
            {
              facets: b.facets,
              status: b.status,
              openingHours: b.openingHours,
            },
            selected,
          ),
        );
        if (hits.length) {
          push({ category, facet: rule.facet, facetValue: value });
        }
      }
    }
  }
  return out;
}

export function canonicalizeFacetMap(
  raw: Record<string, unknown> | undefined,
): { ok: true; value: Record<string, string[]> } | { ok: false; error: string } {
  if (raw === undefined) return { ok: true, value: {} };
  const out: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!isKnownFacetKey(key)) {
      return { ok: false, error: `unknown facet key: ${key}` };
    }
    const list = Array.isArray(val) ? val : [val];
    const slugs: string[] = [];
    for (const item of list) {
      if (typeof item !== "string") {
        return { ok: false, error: `facet ${key} values must be strings` };
      }
      const slug = canonicalizeFacetValue(key, item);
      if (!slug) {
        return { ok: false, error: `unknown value for ${key}: ${item}` };
      }
      if (!slugs.includes(slug)) slugs.push(slug);
    }
    if (slugs.length) out[key] = slugs;
  }
  return { ok: true, value: out };
}
