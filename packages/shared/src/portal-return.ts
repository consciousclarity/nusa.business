/**
 * Portal deep-link return targets after login/register/recovery.
 * Blocks open redirects: only same-app relative paths under known prefixes.
 */
const ALLOWED_PREFIXES = [
  "/",
  "/claim",
  "/listings",
  "/bookings",
  "/field",
  "/vendor",
  "/invites",
  "/register",
  "/recovery",
];

export function safePortalReturnTo(
  raw: string | null | undefined,
  fallback = "/",
): string {
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("://") || value.includes("\\")) return fallback;
  if (/[\x00-\x1f]/.test(value)) return fallback;

  const pathOnly = value.split(/[?#]/, 1)[0] || "/";
  const ok = ALLOWED_PREFIXES.some(
    (prefix) =>
      pathOnly === prefix ||
      (prefix !== "/" && pathOnly.startsWith(`${prefix}/`)),
  );
  return ok ? value : fallback;
}

/** Extract businessId from a claim return path like `/claim?businessId=biz-x`. */
export function businessIdFromReturnTo(returnTo: string): string | undefined {
  try {
    const url = new URL(returnTo, "http://portal.local");
    if (url.pathname !== "/claim") return undefined;
    const id = url.searchParams.get("businessId")?.trim();
    return id || undefined;
  } catch {
    return undefined;
  }
}
