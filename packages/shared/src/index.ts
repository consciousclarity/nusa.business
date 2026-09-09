export type PlaceType = "kabupaten" | "kota" | "tourist_area";

export type BusinessStatus = "draft" | "published" | "claimed";

export type UserRole =
  | "visitor"
  | "owner"
  | "vendor"
  | "field_agent"
  | "admin";

export type BookingMode = "service" | "rental" | "event" | "none";

export type ClaimStatus = "pending" | "approved" | "rejected";

export type HostContext =
  | { kind: "nation" }
  | { kind: "island"; island: string }
  | { kind: "place"; island: string; place: string }
  | { kind: "unknown"; host: string };

const ROOT_SUFFIXES = ["nusa.business", "localhost", "127.0.0.1"];

/**
 * Legacy island slugs kept working after renames (DNS/Caddy may still serve
 * the old label while `*.{new}` wildcards are grey-clouded for LE).
 */
const ISLAND_SLUG_ALIASES: Record<string, string> = {
  jawa: "java",
  sumatera: "sumatra",
};

/** Map legacy island slugs to the canonical store/routing slug. */
export function canonicalizeIslandSlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  return ISLAND_SLUG_ALIASES[s] ?? s;
}

/** Lowercase kebab-case slug, strip diacritics-ish chars. */
export function toSlug(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Parse multi-tenant host:
 * - nusa.business | localhost → nation
 * - bali.nusa.business | bali.localhost → island
 * - gianyar.bali.nusa.business | gianyar.bali.localhost → place
 */
export function parseHost(hostHeader: string): HostContext {
  const host = hostHeader.split(":")[0]?.toLowerCase().trim() ?? "";
  if (!host) return { kind: "nation" };

  for (const suffix of ROOT_SUFFIXES) {
    if (host === suffix) return { kind: "nation" };
    if (host.endsWith(`.${suffix}`)) {
      const sub = host.slice(0, -(suffix.length + 1));
      const parts = sub.split(".").filter(Boolean);
      if (parts.length === 1) {
        return {
          kind: "island",
          island: canonicalizeIslandSlug(parts[0]!),
        };
      }
      if (parts.length === 2) {
        return {
          kind: "place",
          place: parts[0]!,
          island: canonicalizeIslandSlug(parts[1]!),
        };
      }
      return { kind: "unknown", host };
    }
  }

  return { kind: "unknown", host };
}

/** Dev fallback: /host/uluwatu.bali/path → host context + remaining path */
export function parseDevHostPath(pathname: string): {
  context: HostContext;
  pathname: string;
} | null {
  const match = pathname.match(/^\/host\/([^/]+)(\/.*)?$/);
  if (!match) return null;
  const label = match[1]!;
  const rest = match[2] || "/";
  const parts = label.split(".").filter(Boolean);
  if (parts.length === 1) {
    return {
      context: {
        kind: "island",
        island: canonicalizeIslandSlug(parts[0]!),
      },
      pathname: rest,
    };
  }
  if (parts.length === 2) {
    return {
      context: {
        kind: "place",
        place: parts[0]!,
        island: canonicalizeIslandSlug(parts[1]!),
      },
      pathname: rest,
    };
  }
  return { context: { kind: "nation" }, pathname: rest };
}

export function publicUrl(opts: {
  island?: string;
  place?: string;
  area?: string;
  slug?: string;
  category?: string;
  facet?: string;
  facetValue?: string;
  root?: string;
}): string {
  const root = opts.root ?? "https://nusa.business";
  const base = new URL(root);
  if (opts.place && opts.island) {
    base.hostname = `${opts.place}.${opts.island}.${base.hostname.replace(/^www\./, "")}`;
  } else if (opts.island) {
    base.hostname = `${opts.island}.${base.hostname.replace(/^www\./, "")}`;
  }
  const segs = opts.category
    ? [opts.area, "c", opts.category, opts.facet, opts.facetValue]
    : [opts.area, opts.slug];
  const path = segs.filter(Boolean).join("/");
  base.pathname = path ? `/${path}` : "/";
  return base.toString().replace(/\/$/, path ? "" : "/");
}

/**
 * Href for the brand / breadcrumb label "nusa.business".
 * On real nested hosts this must be the nation apex — never "/" (which would
 * keep the visitor on java.nusa.business or jakarta.java.nusa.business).
 * Local/dev keeps a same-origin "/".
 */
export function nationHomeHref(
  hostHeader: string,
  root = "https://nusa.business",
): string {
  const host = hostHeader.split(":")[0]?.toLowerCase().trim() ?? "";
  const useReal = host === "nusa.business" || host.endsWith(".nusa.business");
  if (!useReal) return "/";
  return root.endsWith("/") ? root : `${root}/`;
}

export {
  CATEGORIES,
  CATEGORY_LABELS_ID,
  RELATED_AS_ID,
  TAXONOMY,
  canonicalizeCategory,
  canonicalizeCategoryList,
  categoryFilterOptions,
  categoryLabel,
  categoryLabels,
  categoryRecord,
  expandCategoryFilter,
  isKnownCategory,
  listingMatchesCategory,
  relatedAsLabel,
  relatedForCategory,
  taxonomyCatalog,
  type Category,
  type CategoryLocale,
  type CategoryRecord,
  type RelatedCategory,
  type TaxonomyCatalogGroup,
  type TaxonomyGroup,
  type TaxonomyLeaf,
  type TaxonomyRelated,
} from "./taxonomy.js";

export {
  GLOBAL_FACETS,
  INDEXABLE_FACET_PATHS,
  canonicalizeFacetValue,
  facetValueLabel,
  facetsForCategory,
  facetsForListingCategory,
  isIndexableFacetPath,
  isKnownFacetKey,
  knownFacetKeys,
  serializeFacetsCatalog,
  type FacetDef,
  type FacetSource,
  type FacetValue,
} from "./facets.js";

export {
  applyFacetQuery,
  canonicalizeFacetMap,
  extraQueryFacetCount,
  facetIndexPolicy,
  facetPathSegments,
  facetQueryParams,
  indexableBrowsePathsForListings,
  listingMatchesFacets,
  parseFacetPath,
  parseFacetQueryParams,
  promoteIndexablePath,
  type FacetBrowse,
  type FacetIndexPolicy,
  type FacetMatchContext,
  type FacetSelection,
  type IndexableBrowsePath,
} from "./facet-query.js";

export {
  assertBrowserSafeApiOrigin,
  assertSsrApiOrigin,
  isInternalOrLocalHostname,
  resolveBrowserApiOrigin,
  resolveSsrApiOrigin,
  stripTrailingSlash,
} from "./api-origins.js";

export {
  contactDigits,
  mapsHref,
  telHref,
  websiteHref,
  whatsappHref,
} from "./contact-links.js";

export {
  parseCorsOriginAllowlist,
  resolveCorsAllowOrigin,
  type CorsOriginOptions,
} from "./cors-origins.js";

export {
  businessIdFromReturnTo,
  safePortalReturnTo,
} from "./portal-return.js";

export {
  geoNesting,
  publicHostLine,
  type GeoNesting,
  type NestablePlace,
} from "./geo-urls.js";

export {
  absoluteUrl,
  breadcrumbJsonLd,
  escapeXml,
  hostPath,
  localBusinessJsonLd,
  requestHost,
  siteOrigin,
  sitemapXml,
  websiteJsonLd,
  type JsonLd,
} from "./seo.js";

export {
  alternateLocale,
  detectLocale,
  withLocale,
  type Locale,
  LOCALES,
} from "./locale.js";

export { normalizeAddress, haversineKm } from "./geo.js";
