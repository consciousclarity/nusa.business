/**
 * Separate SSR (internal) and browser (public) API origins.
 *
 * Compose service hostnames like `http://api:8787` are fine for server-side
 * fetch inside Docker, but must never be embedded in client scripts.
 */

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Hostnames that must not appear in browser-facing API URLs. */
export function isInternalOrLocalHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "::1") {
    return true;
  }
  if (h === "api" || h.endsWith(".internal") || h.endsWith(".local")) {
    return true;
  }
  // Docker Compose DNS names are typically a single label (no dot).
  if (!h.includes(".")) return true;
  return false;
}

export function assertBrowserSafeApiOrigin(
  raw: string,
  opts: { production: boolean; label?: string },
): string {
  const label = opts.label ?? "browser API origin";
  const url = stripTrailingSlash((raw || "").trim());
  if (!url) {
    if (opts.production) {
      throw new Error(`${label} is required in production`);
    }
    return "http://localhost:8787";
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} is not a valid URL: ${raw}`);
  }

  if (!opts.production) {
    return stripTrailingSlash(parsed.origin);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      `${label} must use https in production (got ${parsed.protocol}//${parsed.host})`,
    );
  }
  if (isInternalOrLocalHostname(parsed.hostname)) {
    throw new Error(
      `${label} must not point browsers at an internal/local host (got ${parsed.host})`,
    );
  }
  return stripTrailingSlash(parsed.origin);
}

export function assertSsrApiOrigin(
  raw: string | undefined,
  opts: { production: boolean; label?: string },
): string {
  const label = opts.label ?? "NUSA_SSR_API_URL";
  const url = stripTrailingSlash((raw || "").trim());
  if (!url) {
    if (opts.production) {
      throw new Error(
        `${label} is required in production for server-side API fetches`,
      );
    }
    return "http://localhost:8787";
  }
  try {
    // SSR may intentionally use http://api:8787 on the compose network.
    void new URL(url);
  } catch {
    throw new Error(`${label} is not a valid URL: ${raw}`);
  }
  return url;
}

export function resolveBrowserApiOrigin(env: {
  production: boolean;
  PUBLIC_BROWSER_API_URL?: string;
  PUBLIC_API_URL?: string;
  VITE_API_URL?: string;
}): string {
  const candidate =
    env.PUBLIC_BROWSER_API_URL ||
    env.VITE_API_URL ||
    env.PUBLIC_API_URL ||
    "";
  return assertBrowserSafeApiOrigin(candidate, {
    production: env.production,
    label: "PUBLIC_BROWSER_API_URL / VITE_API_URL",
  });
}

export function resolveSsrApiOrigin(env: {
  production: boolean;
  NUSA_SSR_API_URL?: string;
  PUBLIC_BROWSER_API_URL?: string;
  PUBLIC_API_URL?: string;
}): string {
  if (env.NUSA_SSR_API_URL) {
    return assertSsrApiOrigin(env.NUSA_SSR_API_URL, { production: env.production });
  }
  if (env.production) {
    return assertSsrApiOrigin(undefined, { production: true });
  }
  // Local: fall back to the same origin the browser uses, then PUBLIC_API_URL.
  return assertSsrApiOrigin(
    env.PUBLIC_BROWSER_API_URL || env.PUBLIC_API_URL || "http://localhost:8787",
    { production: false },
  );
}
