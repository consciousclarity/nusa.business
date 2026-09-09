/**
 * Public SEO helpers for the Astro surface (canonical, Open Graph, sitemap).
 * Absolute URLs follow the request host so /host/… works in local/dev and
 * nested *.nusa.business hosts work in production.
 */

import { withLocale } from "./locale.js";
import { categoryLabels } from "./taxonomy.js";

export function requestHost(request: Request): string {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost"
  );
}

/** Prefer PUBLIC_SITE_URL; else derive from the incoming request. */
export function siteOrigin(request: Request): string {
  const configured =
    (typeof process !== "undefined" && process.env.PUBLIC_SITE_URL) ||
    undefined;
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/$/, "");
  }
  const host = requestHost(request);
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`.replace(/\/$/, "");
}

/** Absolute URL for a same-origin path (leading slash). */
export function absoluteUrl(request: Request, path: string): string {
  const origin = siteOrigin(request);
  if (!path || path === "/") return `${origin}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

/**
 * Path used in sitemap / canonical for a tenant page.
 * Local/dev: `/host/{label}/…`. Production nested hosts use `/` or `/{slug}`
 * on the tenant host — callers pass the path they actually serve.
 */
export function hostPath(opts: {
  island: string;
  place?: string;
  area?: string;
  slug?: string;
  category?: string;
  facet?: string;
  facetValue?: string;
}): string {
  const label = opts.place ? `${opts.place}.${opts.island}` : opts.island;
  if (opts.category) {
    const segs = [
      opts.area,
      "c",
      opts.category,
      opts.facet,
      opts.facetValue,
    ].filter(Boolean);
    return `/host/${label}/${segs.join("/")}`;
  }
  const segs = [opts.area, opts.slug].filter(Boolean);
  return segs.length ? `/host/${label}/${segs.join("/")}` : `/host/${label}`;
}

export type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export function websiteJsonLd(opts: {
  url: string;
  name?: string;
  description?: string;
  locale?: string;
}): Record<string, unknown> {
  const locale = opts.locale === "id" ? "id" : "en";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: opts.name ?? "nusa.business",
    url: opts.url,
    inLanguage: locale,
    description:
      opts.description ??
      "Local business directory indexed by nested geography across Indonesia.",
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function localBusinessJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  address?: string;
  telephone?: string;
  categories?: string[];
  lat?: number;
  lng?: number;
  locale?: string;
}): Record<string, unknown> {
  const locale = opts.locale === "id" ? "id" : "en";
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: locale,
  };
  if (opts.address) {
    node.address = {
      "@type": "PostalAddress",
      streetAddress: opts.address,
      addressCountry: "ID",
    };
  }
  if (opts.telephone) node.telephone = opts.telephone;
  if (opts.categories?.length) {
    node.additionalType = categoryLabels(opts.categories, locale);
  }
  if (
    typeof opts.lat === "number" &&
    Number.isFinite(opts.lat) &&
    typeof opts.lng === "number" &&
    Number.isFinite(opts.lng)
  ) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: opts.lat,
      longitude: opts.lng,
    };
  }
  return node;
}

/** Canonical path plus `/id` counterpart for the public sitemap. */
export function localeSitemapPaths(path: string): string[] {
  const normalized =
    !path || path === "/"
      ? "/"
      : path.startsWith("/")
        ? path
        : `/${path}`;
  if (normalized === "/id" || normalized.startsWith("/id/")) {
    return [normalized];
  }
  return [normalized, withLocale(normalized, "id")];
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function sitemapXml(urls: string[]): string {
  const body = urls
    .map(
      (loc) =>
        `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
