import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LISTING_HOURS_TIMEZONE,
  listingHoursStatus,
  zonedWeekdayMinutes,
} from "@nusa/shared";

const hours = [
  { day: "Mon", open: "09:00", close: "21:00" },
  { day: "Tue", open: "09:00", close: "21:00" },
  { day: "Wed", open: "09:00", close: "21:00" },
  { day: "Thu", open: "09:00", close: "21:00" },
  { day: "Fri", open: "09:00", close: "22:00" },
  { day: "Sat", open: "09:00", close: "22:00" },
  { day: "Sun", open: "10:00", close: "21:00" },
];

describe("listingHoursStatus (Asia/Makassar WITA)", () => {
  it("documents WITA as the listing clock", () => {
    assert.equal(LISTING_HOURS_TIMEZONE, "Asia/Makassar");
  });

  it("is open mid-morning Thursday in Bali, even when the process is UTC", () => {
    // 10:00 WITA = 02:00 UTC on Thursday 10 Sep 2026
    const now = new Date("2026-09-10T02:00:00.000Z");
    const zoned = zonedWeekdayMinutes(now);
    assert.equal(zoned.day, "Thu");
    assert.equal(zoned.minutes, 10 * 60);
    assert.deepEqual(listingHoursStatus(hours, now), {
      open: true,
      today: "Thu",
    });
  });

  it("is closed after evening hours the same UTC calendar day", () => {
    // 22:00 WITA Thursday = 14:00 UTC
    const now = new Date("2026-09-10T14:00:00.000Z");
    assert.deepEqual(listingHoursStatus(hours, now), {
      open: false,
      today: "Thu",
    });
  });

  it("does not use the process timezone (UTC would call 02:00 'closed')", () => {
    const now = new Date("2026-09-10T02:00:00.000Z");
    assert.equal(now.getUTCHours(), 2);
    assert.equal(listingHoursStatus(hours, now).open, true);
  });

  it("hides the live label when there is no row for today", () => {
    assert.equal(
      listingHoursStatus(
        [{ day: "Mon", open: "09:00", close: "17:00" }],
        new Date("2026-09-10T02:00:00.000Z"),
      ).open,
      null,
    );
    assert.equal(listingHoursStatus([], new Date("2026-09-10T02:00:00.000Z")).open, null);
  });

  it("treats closed:true as closed now", () => {
    const now = new Date("2026-09-10T02:00:00.000Z");
    assert.equal(
      listingHoursStatus(
        [{ day: "Thu", open: "09:00", close: "21:00", closed: true }],
        now,
      ).open,
      false,
    );
  });

  it("handles overnight rows (close before open)", () => {
    const row = [{ day: "Thu", open: "18:00", close: "02:00" }];
    assert.equal(
      listingHoursStatus(row, new Date("2026-09-10T12:00:00.000Z")).open, // 20:00 WITA
      true,
    );
    assert.equal(
      listingHoursStatus(row, new Date("2026-09-10T04:00:00.000Z")).open, // 12:00 WITA
      false,
    );
  });
});
