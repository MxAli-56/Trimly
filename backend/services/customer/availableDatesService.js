
import mongoose from "mongoose";
import { getBarberAvailability } from "./availabilityService.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatKarachiDate = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
};

export const getAvailableDates = async (
  barberId,
  query = {}
) => {
  const { serviceId, days = 30 } = query;

  if (!mongoose.isValidObjectId(barberId)) {
    throw createError("Invalid barber ID");
  }

  if (!mongoose.isValidObjectId(serviceId)) {
    throw createError("Valid serviceId is required");
  }

  const totalDays = Number(days);

  if (
    !Number.isInteger(totalDays) ||
    totalDays < 1 ||
    totalDays > 60
  ) {
    throw createError("Days must be between 1 and 60");
  }

  const availableDates = [];
  const today = formatKarachiDate(new Date());

  const startDate = new Date(`${today}T00:00:00Z`);

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(
      startDate.getTime() + i * 86400000
    );

    const date = currentDate.toISOString().slice(0, 10);

    const availability = await getBarberAvailability(
      barberId,
      { date, serviceId }
    );

    if (availability.isAvailable) {
      availableDates.push({
        date,
        dayOfWeek: availability.dayOfWeek,
        availableSlots: availability.totalAvailableSlots,
      });
    }
  }

  return {
    barberId,
    serviceId,
    checkedDays: totalDays,
    totalAvailableDates: availableDates.length,
    availableDates,
  };
};
