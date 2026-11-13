import mongoose from "mongoose";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as serviceRepository from "../../repository/serviceRepository.js";
import * as barberScheduleRepository from "../../repository/barberScheduleRepository.js";
import * as bookingRepository from "../../repository/bookingRepository.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const getKarachiNow = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
};

const getDayOfWeek = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  return [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][date.getUTCDay()];
};

export const getBarberAvailability = async (barberId, query = {}) => {
  const { date, serviceId } = query;

  if (!mongoose.isValidObjectId(barberId)) {
    throw createError("Invalid barber profile ID");
  }

  if (!mongoose.isValidObjectId(serviceId)) {
    throw createError("Valid serviceId is required");
  }

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError("Date must be in YYYY-MM-DD format");
  }

  const selectedDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(selectedDate.getTime()) ||
    selectedDate.toISOString().slice(0, 10) !== date
  ) {
    throw createError("Invalid date");
  }

  const now = getKarachiNow();

  if (date < now.date) {
    throw createError("Cannot check availability for past dates");
  }

  const barber = await barberProfileRepository.findBarberProfile(barberId);

  if (!barber) {
    throw createError("Barber not found", 404);
  }

  if (barber.isAvailable === false) {
    return {
      barberId,
      date,
      isAvailable: false,
      totalAvailableSlots: 0,
      availableSlots: [],
      message: "Barber is currently unavailable",
    };
  }

  const service = await serviceRepository.findActiveService(serviceId);

  if (!service) {
    throw createError("Service not found", 404);
  }

  if (String(service.branchId) !== String(barber.currentBranchId)) {
    // branchId -> currentBranchId
    throw createError("Service does not belong to barber's salon");
  }

  const duration = service.durationMinutes;

  if (!Number.isInteger(duration) || duration < 5) {
    throw createError("Invalid service duration", 500);
  }

  const dayOfWeek = getDayOfWeek(date);
  const schedule = await barberScheduleRepository.findScheduleByDay(
    barberId,
    dayOfWeek,
  );

  if (!schedule || !schedule.isWorkingDay) {
    // isWorkingDay check
    return {
      barberId,
      date,
      dayOfWeek,
      isAvailable: false,
      totalAvailableSlots: 0,
      availableSlots: [],
      message: "Barber is not working on this day",
    };
  }

  const workStart = toMinutes(schedule.startTime);
  const workEnd = toMinutes(schedule.endTime);

  if (workEnd <= workStart) {
    throw createError("Invalid barber schedule", 500);
  }

  const hasBreak = Boolean(schedule.breakStart && schedule.breakEnd);
  const breakStart = hasBreak ? toMinutes(schedule.breakStart) : null;
  const breakEnd = hasBreak ? toMinutes(schedule.breakEnd) : null;

  if (
    hasBreak &&
    (breakStart >= breakEnd || breakStart < workStart || breakEnd > workEnd)
  ) {
    throw createError("Invalid barber break schedule", 500);
  }

  const dateStart = selectedDate;
  const dateEnd = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);

  const bookings = await bookingRepository.findBookingsForDate(
    barber.userId,
    dateStart,
    dateEnd,
  );

  const availableSlots = [];

  for (let start = workStart; start + duration <= workEnd; start += 15) {
    const end = start + duration;

    if (date === now.date && start <= now.minutes) {
      continue;
    }

    if (hasBreak && start < breakEnd && end > breakStart) {
      continue;
    }

    const hasConflict = bookings.some((booking) => {
      const bookingStart = toMinutes(booking.startTime);
      const bookingEnd = toMinutes(booking.endTime);
      return start < bookingEnd && end > bookingStart;
    });

    if (hasConflict) {
      continue;
    }

    availableSlots.push({
      startTime: toTime(start),
      endTime: toTime(end),
    });
  }

  return {
    barberId,
    branchId: barber.currentBranchId, // branchId -> currentBranchId
    serviceId,
    serviceName: service.name,
    date,
    dayOfWeek,
    durationMinutes: duration,
    workingHours: {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    },
    break: hasBreak
      ? { startTime: schedule.breakStart, endTime: schedule.breakEnd }
      : null,
    isAvailable: availableSlots.length > 0,
    totalAvailableSlots: availableSlots.length,
    availableSlots,
  };
};