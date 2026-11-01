
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

export const getSuggestedSlots = async (
  barberId,
  query = {}
) => {
  const {
    date,
    serviceId,
    preferredTime,
    limit = 5,
  } = query;

  // 1. Validate preferred time
  if (
    typeof preferredTime !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(preferredTime)
  ) {
    throw createError(
      "Valid preferredTime is required (HH:mm)"
    );
  }

  // 2. Validate limit
  const parsedLimit = Number(limit);

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1 ||
    parsedLimit > 20
  ) {
    throw createError("Limit must be between 1 and 20");
  }

  // 3. Reuse existing availability calculation
  const availability = await getBarberAvailability(
    barberId,
    { date, serviceId }
  );

  const preferredMinutes = toMinutes(preferredTime);

  // 4. Sort slots by distance from preferred time
  const suggestedSlots = (
    availability.availableSlots ?? []
  )
    .map((slot) => {
      const slotMinutes = toMinutes(slot.startTime);

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        differenceMinutes: Math.abs(
          slotMinutes - preferredMinutes
        ),
      };
    })
    .sort((a, b) => {
      if (a.differenceMinutes !== b.differenceMinutes) {
        return a.differenceMinutes - b.differenceMinutes;
      }

      return toMinutes(a.startTime) - toMinutes(b.startTime);
    })
    .slice(0, parsedLimit);

  // 5. Return result
  return {
    barberId,
    serviceId,
    date,
    preferredTime,
    durationMinutes:
      availability.durationMinutes ?? null,
    totalSuggestedSlots: suggestedSlots.length,
    suggestedSlots,
    message: suggestedSlots.length
      ? "Suggested slots fetched successfully"
      : "No available slots found for this date",
  };
};
