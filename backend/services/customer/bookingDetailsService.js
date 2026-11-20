
import mongoose from "mongoose";

import {
  findBarbersByBranchId,
  findBarberProfileForAvailability,
} from "../../repository/barberProfileRepository.js";

import {
  findScheduleByDay,
} from "../../repository/barberScheduleRepository.js";

import {
  findBookingsForDate,
  findBookingStatuses,
} from "../../repository/bookingRepository.js";

import {
  findServicesByIds,
} from "../../repository/serviceRepository.js";

const TIME_ZONE = "Asia/Karachi";
const SLOT_STEP = 30;

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const isValidId = (id) =>
  mongoose.isObjectIdOrHexString(id);

const toMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const toTime = (value) => {
  const hour = Math.floor(value / 60);
  const minute = value % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const getToday = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type) =>
    parts.find((part) => part.type === type).value;

  return `${get("year")}-${get("month")}-${get("day")}`;
};

const getCurrentTime = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type) =>
    Number(parts.find((part) => part.type === type).value);

  return get("hour") * 60 + get("minute");
};

const addDays = (dateString, count) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
};

const getDayOfWeek = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  return days[date.getUTCDay()];
};

const validateDate = (date) => {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    fail("Date must be YYYY-MM-DD");
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    fail("Invalid date");
  }

  if (date < getToday()) {
    fail("Past dates are not allowed");
  }
};

const parseServiceIds = (value) => {
  const ids = (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item || "").split(","))
    .map((id) => id.trim())
    .filter(Boolean);

  const uniqueIds = [...new Set(ids)];

  if (!uniqueIds.length) {
    fail("serviceIds is required");
  }

  if (!uniqueIds.every(isValidId)) {
    fail("Invalid serviceIds");
  }

  return uniqueIds;
};

const prepareBarber = async (barberId, serviceIds) => {
  if (!isValidId(barberId)) {
    fail("Invalid barber profile ID");
  }

  const barber = await findBarberProfileForAvailability(
    barberId,
  );

  if (!barber) {
    fail("Barber not found", 404);
  }

  if (!barber.currentBranchId) {
    fail("Barber is not assigned to a salon", 400);
  }

  const ids = parseServiceIds(serviceIds);

  const services = await findServicesByIds(
    ids,
    barber.currentBranchId,
  );

  if (services.length !== ids.length) {
    fail("One or more services are invalid for this salon");
  }

  const durationMinutes = services.reduce(
    (total, service) => total + service.durationMinutes,
    0,
  );

  if (durationMinutes <= 0) {
    fail("Invalid service duration");
  }

  return {
    barber,
    durationMinutes,
  };
};

const getBlockingStatusIds = async () => {
  const statuses = await findBookingStatuses();

  const blockingNames = new Set([
    "PENDING",
    "ACCEPTED",
    "PENDING_BARBER",
    "PENDING_CUSTOMER",
    "PENDING_CUSTOMER_RESCHEDULE",
    "PENDING_BARBER_APPROVAL",
    "CONFIRMED",
    "IN_PROGRESS",
  ]);

  return new Set(
    statuses
      .filter((status) => blockingNames.has(status.name))
      .map((status) => String(status._id)),
  );
};

const calculateAvailableSlots = async (
  barber,
  date,
  durationMinutes,
  blockingStatusIds,
) => {
  if (!barber.isAvailable) {
    return [];
  }

  const schedule = await findScheduleByDay(
    barber._id,
    getDayOfWeek(date),
  );

  if (!schedule || !schedule.isWorkingDay) {
    return [];
  }

  const dayStart = toMinutes(schedule.startTime);
  const dayEnd = toMinutes(schedule.endTime);

  const breakStart = schedule.breakStart
    ? toMinutes(schedule.breakStart)
    : null;

  const breakEnd = schedule.breakEnd
    ? toMinutes(schedule.breakEnd)
    : null;

  const dateStart = new Date(`${date}T00:00:00.000Z`);
  const dateEnd = new Date(dateStart);
  dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);

  const bookings = await findBookingsForDate(
    barber.userId,
    dateStart,
    dateEnd,
  );

  const now = new Date();

  const busyBookings = bookings.filter((booking) => {
    if (!blockingStatusIds.has(String(booking.statusId))) {
      return false;
    }

    // Expired temporary booking hold
    if (
      booking.holdExpiresAt &&
      new Date(booking.holdExpiresAt) <= now
    ) {
      return false;
    }

    return true;
  });

  const slots = [];

  for (
    let start = dayStart;
    start + durationMinutes <= dayEnd;
    start += SLOT_STEP
  ) {
    const end = start + durationMinutes;

    if (date === getToday() && start <= getCurrentTime()) {
      continue;
    }

    if (
      breakStart !== null &&
      breakEnd !== null &&
      start < breakEnd &&
      end > breakStart
    ) {
      continue;
    }

    const isBooked = busyBookings.some((booking) => {
      const bookedStart = toMinutes(booking.startTime);
      const bookedEnd = toMinutes(booking.endTime);

      return start < bookedEnd && end > bookedStart;
    });

    if (isBooked) {
      continue;
    }

    slots.push({
      startTime: toTime(start),
      endTime: toTime(end),
      isAvailable: true,
    });
  }

  return slots;
};

// API 1
export const fetchSalonBarbers = async (branchId) => {
  if (!isValidId(branchId)) {
    fail("Invalid branch ID");
  }

  return await findBarbersByBranchId(branchId);
};

// API 2
export const fetchAvailableDates = async (
  barberId,
  serviceIds,
  days = 30,
) => {
  const count = Number(days);

  if (!Number.isInteger(count) || count < 1 || count > 90) {
    fail("days must be between 1 and 90");
  }

  const { barber, durationMinutes } = await prepareBarber(
    barberId,
    serviceIds,
  );

  const blockingStatusIds = await getBlockingStatusIds();

  const today = getToday();
  const availableDates = [];

  for (let i = 0; i < count; i++) {
    const date = addDays(today, i);

    const slots = await calculateAvailableSlots(
      barber,
      date,
      durationMinutes,
      blockingStatusIds,
    );

    if (slots.length > 0) {
      availableDates.push(date);
    }
  }

  return {
    barberId,
    durationMinutes,
    availableDates,
  };
};

// API 3
export const fetchAvailableSlots = async (
  barberId,
  date,
  serviceIds,
) => {
  validateDate(date);

  const { barber, durationMinutes } = await prepareBarber(
    barberId,
    serviceIds,
  );

  const blockingStatusIds = await getBlockingStatusIds();

  const availableSlots = await calculateAvailableSlots(
    barber,
    date,
    durationMinutes,
    blockingStatusIds,
  );

  return {
    barberId,
    date,
    durationMinutes,
    availableSlots,
  };
};
