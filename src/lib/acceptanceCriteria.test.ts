import { describe, expect, test } from "vitest";
import { checkAvailability } from "./availability";
import type { Booking, ReasonCategory, Room } from "@/types";

const room: Room = {
  id: "room-x",
  name: "Room X",
  building: "X Block",
  capacity: 20,
  blocked: false,
  equipment: [],
};

const existingBookings: Booking[] = [
  { id: "b1", roomId: "room-x", start: 600, end: 660, title: "Existing Session", bookedBy: "Prof. Fictional" },
];

const base = { room, existingBookings, currentTime: 540 };

describe("acceptance criteria contract", () => {
  test("AC1 — start in the future: past start unavailable, future start available", () => {
    const past = checkAvailability({ ...base, start: 480, end: 540 });
    expect(past.isAvailable).toBe(false);
    expect(past.reasonCategory).toBe("start-in-past");
    expect(past.reason).toMatch(/later start/i);

    const now = checkAvailability({ ...base, start: 540, end: 600 });
    expect(now.isAvailable).toBe(false);
    expect(now.reasonCategory).toBe("start-in-past");

    const future = checkAvailability({ ...base, start: 541, end: 600 });
    expect(future.isAvailable).toBe(true);
    expect(future.reasonCategory).toBe("ok");
  });

  test("AC2 — duration must be > 0 and <= 120 minutes", () => {
    const zero = checkAvailability({ ...base, start: 700, end: 700 });
    expect(zero.isAvailable).toBe(false);
    expect(zero.reasonCategory).toBe("invalid-interval");
    expect(zero.reason).toMatch(/start time must be before the end time/i);

    const reversed = checkAvailability({ ...base, start: 720, end: 700 });
    expect(reversed.isAvailable).toBe(false);
    expect(reversed.reasonCategory).toBe("invalid-interval");

    const tooLong = checkAvailability({ ...base, start: 700, end: 821 });
    expect(tooLong.isAvailable).toBe(false);
    expect(tooLong.reasonCategory).toBe("too-long");
    expect(tooLong.reason).toMatch(/120-minute maximum/i);

    const exactly120 = checkAvailability({ ...base, start: 700, end: 820 });
    expect(exactly120.isAvailable).toBe(true);
    expect(exactly120.reasonCategory).toBe("ok");
  });

  test("AC3 — overlapping bookings are unavailable, touching endpoints allowed", () => {
    const overlap = checkAvailability({ ...base, start: 630, end: 690 });
    expect(overlap.isAvailable).toBe(false);
    expect(overlap.reasonCategory).toBe("time-overlap");
    expect(overlap.reason).toContain("Existing Session");

    const touchStart = checkAvailability({ ...base, start: 550, end: 600 });
    expect(touchStart.isAvailable).toBe(true);

    const touchEnd = checkAvailability({ ...base, start: 660, end: 720 });
    expect(touchEnd.isAvailable).toBe(true);
  });

  test("AC4 — blocked room is unavailable", () => {
    const blockedRoom: Room = { ...room, blocked: true };
    const result = checkAvailability({
      ...base,
      room: blockedRoom,
      start: 700,
      end: 760,
    });
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCategory).toBe("room-blocked");
    expect(result.reason).toMatch(/blocked/i);
  });

  test("AC5 — result never mutates the booking fixtures", () => {
    const snapshot = JSON.parse(JSON.stringify(existingBookings));
    checkAvailability({ ...base, start: 630, end: 690 });
    checkAvailability({ ...base, start: 700, end: 760 });
    expect(existingBookings).toEqual(snapshot);
  });

  test("AC6 — non-parseable time strings surface understandable input-error feedback", () => {
    // Simulates the hook's guard for unparseable HH:MM input (parseTime -> NaN).
    const unparseableStart = Number.NaN;
    const result = checkAvailability({
      ...base,
      start: unparseableStart,
      end: 600,
      currentTime: -1,
    });
    expect(result.isAvailable).toBe(false);
    expect(result.reasonCategory).toBe("input-error");
  });
});
