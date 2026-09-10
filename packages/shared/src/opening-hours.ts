/**
 * Listing “open now” uses **Asia/Makassar (WITA, UTC+8)**.
 *
 * Seed hours for Bali (and the rest of Nusa Tenggara / Sulawesi) are civil
 * clock times, not UTC. CI and the API process run in UTC, so `Date#getHours()`
 * would mislabel a 09:00–21:00 warung as closed all morning.
 *
 * WITA is the right default for the current catalog. Province hubs that sit
 * in WIB (Asia/Jakarta) or WIT (Asia/Jayapura) can pass a different zone
 * later without changing the seed shape.
 */
export const LISTING_HOURS_TIMEZONE = "Asia/Makassar";

export type OpeningHoursRow = {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
};

export type ListingHoursStatus = {
  /** null when there is no row for today — hide the live label. */
  open: boolean | null;
  /** `Mon`…`Sun` in `timeZone`. */
  today: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function hourMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Civil weekday + minutes-from-midnight in an IANA zone. */
export function zonedWeekdayMinutes(
  now: Date,
  timeZone: string = LISTING_HOURS_TIMEZONE,
): { day: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const day = WEEKDAYS.find((d) => d === weekday) ?? weekday;
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return { day, minutes: hour * 60 + minute };
}

function isOpenOnRow(row: OpeningHoursRow, minutes: number): boolean {
  if (row.closed) return false;
  const open = hourMinutes(row.open);
  const close = hourMinutes(row.close);
  if (open === null || close === null) return false;
  if (close === open) return true;
  if (close < open) return minutes >= open || minutes <= close;
  return minutes >= open && minutes <= close;
}

export function listingHoursStatus(
  hours: OpeningHoursRow[] | undefined,
  now: Date = new Date(),
  timeZone: string = LISTING_HOURS_TIMEZONE,
): ListingHoursStatus {
  const { day, minutes } = zonedWeekdayMinutes(now, timeZone);
  if (!hours?.length) return { open: null, today: day };
  const row = hours.find((h) => h.day === day);
  if (!row) return { open: null, today: day };
  return { open: isOpenOnRow(row, minutes), today: day };
}
