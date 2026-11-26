import type { Room, Booking, CheckResult, ReasonCategory } from "@/types";
import { formatTime } from "@/lib/time";

const REASON_LABELS: Record<ReasonCategory, string> = {
  "invalid-interval": "Invalid Time Interval",
  "start-in-past": "Start Time Not Valid",
  "too-long": "Booking Too Long",
  "room-blocked": "Room Blocked",
  "time-overlap": "Time Overlap",
  "input-error": "Input Error",
  ok: "Available",
};

export function reasonLabel(category: ReasonCategory): string {
  return REASON_LABELS[category];
}

interface CheckParams {
  room: Room;
  start: number;
  end: number;
  currentTime: number;
  existingBookings: Booking[];
}

/**
 * Validate a candidate booking interval against all acceptance criteria.
 * Returns a clear Available / Unavailable decision with a reason.
 * Does NOT mutate existing booking data.
 */
export function checkAvailability({
  room,
  start,
  end,
  currentTime,
  existingBookings,
}: CheckParams): CheckResult {
  // AC6: guard against non-numeric input (e.g. unparseable HH:MM strings)
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(currentTime)) {
    return {
      isAvailable: false,
      decision: "unavailable",
      reasonCategory: "input-error",
      reason: "Please enter valid times in HH:MM format and select a room.",
    };
  }

  // AC1: valid interval range and ordering
  if (start < 0 || end > 1440 || start >= end) {
    return {
      isAvailable: false,
      decision: "unavailable",
      reasonCategory: "invalid-interval",
      reason: "The start time must be before the end time, and both must be within 00:00–24:00.",
    };
  }

  // AC1: start must be after the supplied current time
  if (start <= currentTime) {
    return {
      isAvailable: false,
      decision: "unavailable",
      reasonCategory: "start-in-past",
      reason: `The start time must be after the current time (${formatTime(currentTime)}). Please choose a later start.`,
    };
  }

  // AC2: reject bookings longer than 120 minutes
  if (end - start > 120) {
    return {
      isAvailable: false,
      decision: "unavailable",
      reasonCategory: "too-long",
      reason: `The booking is ${end - start} minutes long, which exceeds the 120-minute maximum. Please shorten your time slot.`,
    };
  }

  // AC3: reject if the room is blocked
  if (room.blocked) {
    return {
      isAvailable: false,
      decision: "unavailable",
      reasonCategory: "room-blocked",
      reason: "This room is currently blocked and cannot be booked. Please select a different room.",
    };
  }

  // AC4: reject overlaps with existing bookings (touching endpoints allowed)
  const overlapping = existingBookings.find(
    (b) => b.roomId === room.id && start < b.end && end > b.start
  );

  if (overlapping) {
    return {
      isAvailable: false,
      decision: "unavailable",
      reasonCategory: "time-overlap",
      reason: `The requested time overlaps with an existing booking: "${overlapping.title}" (${formatTime(overlapping.start)}–${formatTime(overlapping.end)}). Choose a non-overlapping slot.`,
    };
  }

  return {
    isAvailable: true,
    decision: "available",
    reasonCategory: "ok",
    reason: `Room is available from ${formatTime(start)} to ${formatTime(end)} (${end - start} min).`,
  };
}
