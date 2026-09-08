/**
 * Browser CORS allowlist for the public API.
 *
 * Nested geo hosts (`place.island.nusa.business`) plus the portal must be able
 * to call the API from the browser. Reflecting any Origin (with credentials)
 * lets unrelated sites read API responses in a visitor's browser.
 */

export type CorsOriginOptions = {
  production: boolean;
  /** Exact origins from `NUSA_CORS_ORIGINS` (comma-separated). */
  extraOrigins?: string[];
  /** Apex hostname whose HTTPS subdomains are allowed (default nusa.business). */
  apexHostname?: string;
};

function parseOrigin(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.username || url.password) return null;
    if (url.pathname !== "/" || url.search || url.hash) return null;
    return url;
  } catch {
    return null;
  }
}

/** Split `NUSA_CORS_ORIGINS` into exact origins (scheme://host[:port]). */
export function parseCorsOriginAllowlist(
  raw: string | null | undefined,
): string[] {
  if (!raw) return [];
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const url = parseOrigin(trimmed);
    if (!url) continue;
    out.push(url.origin);
  }
  return out;
}

function isLoopbackHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1";
}

function isApexOrSubdomain(hostname: string, apex: string): boolean {
  const h = hostname.toLowerCase();
  const a = apex.toLowerCase();
  return h === a || h.endsWith(`.${a}`);
}

/**
 * Returns the Origin to echo in `Access-Control-Allow-Origin`, or null to deny.
 * Missing Origin (curl, SSR, same-origin) is not a browser CORS case — deny
 * reflection so we never emit `*`.
 */
export function resolveCorsAllowOrigin(
  originHeader: string | undefined | null,
  opts: CorsOriginOptions,
): string | null {
  if (!originHeader) return null;
  const origin = originHeader.trim();
  if (!origin) return null;

  const url = parseOrigin(origin);
  if (!url) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const extras = opts.extraOrigins ?? [];
  if (extras.includes(url.origin)) return url.origin;

  const apex = (opts.apexHostname || "nusa.business").toLowerCase();

  if (opts.production) {
    if (url.protocol !== "https:") return null;
    if (isLoopbackHostname(url.hostname)) return null;
    if (isApexOrSubdomain(url.hostname, apex)) return url.origin;
    return null;
  }

  // Development: local frontends + optional apex HTTPS hosts for staging-like tests.
  if (isLoopbackHostname(url.hostname)) return url.origin;
  if (url.protocol === "https:" && isApexOrSubdomain(url.hostname, apex)) {
    return url.origin;
  }
  return null;
}
