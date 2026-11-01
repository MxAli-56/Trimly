
import { getBarberAvailability } from "./availabilityService.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const checkSlotAvailability = async (
  barberId,
  query = {}
) => {
  const { date, serviceId, startTime } = query;

  // 1. Validate start time
  if (
    typeof startTime !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
  ) {
    throw createError(
      "Valid startTime is required (HH:mm)"
    );
  }

  // 2. Get available slots
  // Existing service validates barberId, date, serviceId
  const availability = await getBarberAvailability(
    barberId,
    { date, serviceId }
  );

  // 3. Find selected slot
  const selectedSlot = (
    availability.availableSlots ?? []
  ).find(
    (slot) =>
      toMinutes(slot.startTime) === toMinutes(startTime)
  );

  // 4. Return result
  return {
    barberId,
    serviceId,
    date,
    startTime,
    endTime: selectedSlot?.endTime ?? null,
    isAvailable: Boolean(selectedSlot),
    message: selectedSlot
      ? "Selected slot is available"
      : "Selected slot is not available",
  };
};
