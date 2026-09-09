import {
  resolveBrowserApiOrigin,
  resolveSsrApiOrigin,
} from "@nusa/shared";

const production =
  import.meta.env.PROD === true ||
  (typeof process !== "undefined" && process.env.NODE_ENV === "production");

function readProcess(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

/** Origin for Astro SSR fetches — may be an internal Compose URL. */
export function ssrApiOrigin(): string {
  return resolveSsrApiOrigin({
    production,
    NUSA_SSR_API_URL:
      readProcess("NUSA_SSR_API_URL") || import.meta.env.NUSA_SSR_API_URL,
    PUBLIC_BROWSER_API_URL: import.meta.env.PUBLIC_BROWSER_API_URL,
    PUBLIC_API_URL: import.meta.env.PUBLIC_API_URL,
  });
}

/**
 * Origin for browser fetch() calls (review/booking forms).
 * Must be a public HTTPS URL in production — never `http://api:8787`.
 */
export function browserApiOrigin(): string {
  return resolveBrowserApiOrigin({
    production,
    PUBLIC_BROWSER_API_URL: import.meta.env.PUBLIC_BROWSER_API_URL,
    PUBLIC_API_URL: import.meta.env.PUBLIC_API_URL,
  });
}

export async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${ssrApiOrigin()}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/** Same as api(), but 404 becomes null instead of throwing. */
export async function apiOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${ssrApiOrigin()}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Homepage/search helper: any failure (down API, 5xx, timeout) is null
 * so the search form still renders. Do not use for hubs — those must 404
 * on missing islands and 500 when the API is down.
 */
export async function apiTry<T>(
  path: string,
  timeoutMs = 5000,
): Promise<T | null> {
  try {
    const res = await fetch(`${ssrApiOrigin()}${path}`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
