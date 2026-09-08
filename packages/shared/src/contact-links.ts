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
