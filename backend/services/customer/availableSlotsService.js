
import { getBarberAvailability } from "./availabilityService.js";

export const getAvailableSlots = async (
  barberId,
  query = {}
) => {
  const { date, serviceId } = query;

  // Reuse existing availability calculation
  const availability = await getBarberAvailability(
    barberId,
    { date, serviceId }
  );

  return {
    barberId,
    serviceId,
    date,
    dayOfWeek: availability.dayOfWeek ?? null,
    durationMinutes: availability.durationMinutes ?? null,
    isAvailable: availability.isAvailable,
    totalAvailableSlots:
      availability.totalAvailableSlots ??
      availability.availableSlots?.length ??
      0,
    availableSlots: availability.availableSlots ?? [],
  };
};
