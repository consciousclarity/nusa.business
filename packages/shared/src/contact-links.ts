/**
 * Public contact deep links for Indonesia-first mobile discovery.
 * Prefer WhatsApp (`wa.me`) over in-app chat until Phase 6 messaging exists.
 */

/** Strip to dialable digits; keep a leading + by converting to digits only. */
export function contactDigits(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  // Common local form 08xx… → country code 62 for wa.me
  if (hasPlus) return digits;
  if (digits.startsWith("0") && digits.length >= 9) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

/** `https://wa.me/<digits>` or null when the value is not usable. */
export function whatsappHref(raw: string | null | undefined): string | null {
  const digits = contactDigits(raw);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

/** `tel:+…` href or null. */
export function telHref(raw: string | null | undefined): string | null {
  const digits = contactDigits(raw);
  if (digits.length < 7) return null;
  return `tel:+${digits}`;
}

/**
 * Google Maps destination for Directions. Prefers coordinates when present so
 * the pin matches the listing, not a fuzzy address match.
 */
export function mapsHref(opts: {
  address?: string;
  lat?: number;
  lng?: number;
}): string | null {
  if (
    typeof opts.lat === "number" &&
    Number.isFinite(opts.lat) &&
    typeof opts.lng === "number" &&
    Number.isFinite(opts.lng)
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${opts.lat},${opts.lng}`;
  }
  const addr = (opts.address || "").trim();
  if (!addr) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
}

/** http(s) website only — reject javascript: and other unsafe protocols. */
export function websiteHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
