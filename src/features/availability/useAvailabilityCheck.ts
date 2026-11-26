import { useState } from "react";
import type { CheckResult, Room } from "@/types";
import { rooms } from "@/data/rooms";
import { bookings } from "@/data/bookings";
import { DEFAULT_CURRENT_TIME } from "@/data/config";
import { checkAvailability } from "@/lib/availability";
import { getRoomBookings } from "@/lib/bookings";
import { parseTime } from "@/lib/time";
import { filterByCapacity, filterByEquipment } from "@/lib/roomFilters";

export function useAvailabilityCheck() {
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("12:00");
  const [currentTime, setCurrentTime] = useState(DEFAULT_CURRENT_TIME);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const requiredCapacity = attendeeInput === "" ? 0 : Number(attendeeInput);
  const filteredRooms = filterByEquipment(
    filterByCapacity(rooms, requiredCapacity),
    selectedEquipment
  );
  const selectedRoom =
    filteredRooms.find((r) => r.id === roomId) ?? filteredRooms[0] ?? null;

  const startMin = parseTime(startTime);
  const endMin = parseTime(endTime);

  const buildResult = (room: Room | null): CheckResult => {
    if (!room || Number.isNaN(startMin) || Number.isNaN(endMin)) {
      return {
        isAvailable: false,
        decision: "unavailable",
        reasonCategory: "input-error",
        reason: "Please select a room and enter valid times in HH:MM format.",
      };
    }
    return checkAvailability({
      room,
      start: startMin,
      end: endMin,
      currentTime,
      existingBookings: getRoomBookings(bookings, room.id),
    });
  };

  const runCheck = () => setResult(buildResult(selectedRoom));

  const selectRoom = (room: Room) => {
    setRoomId(room.id);
    if (result) setResult(buildResult(room));
  };

  const updateAttendees = (value: string) => {
    setAttendeeInput(value);
    setResult(null);
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
    setResult(null);
  };

  const updateStartTime = (value: string) => {
    setStartTime(value);
    setResult(null);
  };

  const updateEndTime = (value: string) => {
    setEndTime(value);
    setResult(null);
  };

  const updateCurrentTime = (value: number) => {
    setCurrentTime(value);
    setResult(null);
  };

  return {
    attendeeInput,
    selectedEquipment,
    filteredRooms,
    selectedRoom,
    startTime,
    endTime,
    startMin,
    endMin,
    currentTime,
    result,
    updateAttendees,
    toggleEquipment,
    selectRoom,
    updateStartTime,
    updateEndTime,
    updateCurrentTime,
    runCheck,
  };
}
