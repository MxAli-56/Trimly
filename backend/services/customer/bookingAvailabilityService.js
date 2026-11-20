
import mongoose from "mongoose";
import BarberProfile from "../../model/barberProfileModel.js";
import BarberSchedule from "../../model/barberScheduleModel.js";
import Booking from "../../model/bookingModel.js";
import Service from "../../model/serviceModel.js";
import Status from "../../model/statusModel.js";

const SLOT_INTERVAL = 30;
const TIME_ZONE = "Asia/Karachi";

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const getToday = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

const getCurrentMinutes = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);

  return hour * 60 + minute;
};

const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getDayName = (dateString) => {
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

const parseServiceIds = (value) => {
  const ids = Array.isArray(value)
    ? value.flatMap((item) => String(item).split(","))
    : String(value || "").split(",");

  const cleaned = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];

  if (!cleaned.length) {
    throw Object.assign(new Error("serviceIds is required"), {
      statusCode: 400,
    });
  }

  if (!cleaned.every((id) => mongoose.isValidObjectId(id))) {
    throw Object.assign(new Error("Invalid service ID"), {
      statusCode: 400,
    });
  }

  return cleaned;
};

const prepareAvailability = async (barberId, serviceIds) => {
  if (!mongoose.isValidObjectId(barberId)) {
    throw Object.assign(new Error("Invalid barber ID"), {
      statusCode: 400,
    });
  }

  const barber = await BarberProfile.findOne({
    _id: barberId,
    deletedAt: null,
  });

  if (!barber) {
    throw Object.assign(new Error("Barber not found"), {
      statusCode: 404,
    });
  }

  if (!barber.isAvailable || !barber.currentBranchId) {
    return { barber, duration: 0, unavailable: true };
  }

  const ids = parseServiceIds(serviceIds);

  const services = await Service.find({
    _id: { $in: ids },
    branchId: barber.currentBranchId,
    isActive: true,
    deletedAt: null,
  });

  if (services.length !== ids.length) {
    throw Object.assign(
      new Error("One or more services are invalid for this barber's salon"),
      { statusCode: 400 },
    );
  }

  const duration = services.reduce(
    (total, service) => total + service.durationMinutes,
    0,
  );

  return { barber, duration, unavailable: false };
};

const calculateSlots = async (barber, duration, date) => {
  const schedule = await BarberSchedule.findOne({
    barberProfileId: barber._id,
    dayOfWeek: getDayName(date),
    isWorkingDay: true,
    deletedAt: null,
  });

  if (!schedule) return [];

  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);

  const breakStart = schedule.breakStart
    ? toMinutes(schedule.breakStart)
    : null;

  const breakEnd = schedule.breakEnd
    ? toMinutes(schedule.breakEnd)
    : null;

  const bookingStart = new Date(`${date}T00:00:00.000Z`);
  const bookingEnd = new Date(bookingStart);
  bookingEnd.setUTCDate(bookingEnd.getUTCDate() + 1);

  const bookings = await Booking.find({
    barberId: barber.userId,
    bookingDate: {
      $gte: bookingStart,
      $lt: bookingEnd,
    },
    deletedAt: null,
  }).populate("statusId", "name type");

  const blockingStatuses = new Set([
    "PENDING",
    "ACCEPTED",
    "PENDING_BARBER",
    "PENDING_CUSTOMER",
    "PENDING_CUSTOMER_RESCHEDULE",
    "PENDING_BARBER_APPROVAL",
    "CONFIRMED",
    "IN_PROGRESS",
  ]);

  const now = new Date();

  const busyBookings = bookings.filter((booking) => {
    const status = booking.statusId;

    if (!status || status.type !== "BOOKING") return true;

    if (!blockingStatuses.has(status.name)) return false;

    if (
      booking.holdExpiresAt &&
      booking.holdExpiresAt <= now &&
      ["PENDING", "ACCEPTED", "PENDING_BARBER", "PENDING_CUSTOMER"].includes(
        status.name,
      )
    ) {
      return false;
    }

    return true;
  });

  const today = getToday();
  const currentMinutes = getCurrentMinutes();
  const slots = [];

  for (
    let slotStart = start;
    slotStart + duration <= end;
    slotStart += SLOT_INTERVAL
  ) {
    const slotEnd = slotStart + duration;

    if (date === today && slotStart <= currentMinutes) continue;

    if (
      breakStart !== null &&
      breakEnd !== null &&
      slotStart < breakEnd &&
      slotEnd > breakStart
    ) {
      continue;
    }

    const isBooked = busyBookings.some((booking) => {
      const bookedStart = toMinutes(booking.startTime);
      const bookedEnd = toMinutes(booking.endTime);

      return slotStart < bookedEnd && slotEnd > bookedStart;
    });

    if (isBooked) continue;

    slots.push({
      startTime: toTime(slotStart),
      endTime: toTime(slotEnd),
      isAvailable: true,
    });
  }

  return slots;
};

export const fetchAvailableDates = async (
  barberId,
  serviceIds,
  days = 30,
) => {
  const count = Number(days);

  if (!Number.isInteger(count) || count < 1 || count > 90) {
    throw Object.assign(
      new Error("days must be between 1 and 90"),
      { statusCode: 400 },
    );
  }

  const { barber, duration, unavailable } =
    await prepareAvailability(barberId, serviceIds);

  if (unavailable) {
    return { barberId, availableDates: [] };
  }

  const today = getToday();
  const availableDates = [];

  for (let i = 0; i < count; i++) {
    const date = addDays(today, i);
    const slots = await calculateSlots(barber, duration, date);

    if (slots.length > 0) {
      availableDates.push(date);
    }
  }

  return {
    barberId,
    durationMinutes: duration,
    availableDates,
  };
};

export const fetchAvailableSlots = async (
  barberId,
  date,
  serviceIds,
) => {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(`${date}T00:00:00.000Z`)) ||
    new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date
  ) {
    throw Object.assign(
      new Error("Valid date is required (YYYY-MM-DD)"),
      { statusCode: 400 },
    );
  }

  if (date < getToday()) {
    throw Object.assign(
      new Error("Past dates are not allowed"),
      { statusCode: 400 },
    );
  }

  const { barber, duration, unavailable } =
    await prepareAvailability(barberId, serviceIds);

  if (unavailable) {
    return { barberId, date, availableSlots: [] };
  }

  const availableSlots = await calculateSlots(
    barber,
    duration,
    date,
  );

  return {
    barberId,
    date,
    durationMinutes: duration,
    availableSlots,
  };
};
