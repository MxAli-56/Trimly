
import mongoose from "mongoose";
import * as availabilityRepository from "../../repository/barberAvailabilityRepository.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getKarachiTime = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return {
    day: values.weekday.toLowerCase(),
    time: `${values.hour}:${values.minute}`,
  };
};

export const getBarberAvailabilityStatus = async (barberId) => {
  // Step 1: Validate ID
  if (!mongoose.isValidObjectId(barberId)) {
    throw createError("Invalid barber ID", 400);
  }

  // Step 2: Find barber profile
  const barber =
    await availabilityRepository.findActiveBarberProfile(barberId);

  if (!barber) {
    throw createError("Barber not found", 404);
  }

  // Step 3: Check barber active status
  if (barber.isActive === false) {
    return {
      barberId,
      isAvailable: false,
      status: "INACTIVE",
      message: "Barber is currently inactive",
    };
  }

  // Step 4: Fetch schedule
  const schedule =
    await availabilityRepository.findBarberSchedule(barberId);

  if (!schedule) {
    return {
      barberId,
      isAvailable: false,
      status: "SCHEDULE_NOT_CONFIGURED",
      message: "Barber schedule is not configured",
    };
  }

  // Step 5: Check current working hours
  const { day, time } = getKarachiTime();

  // Assumes schedule.workingHours is an object
  // keyed by weekday, e.g. monday: { open, close }
  const todaySchedule = schedule.workingHours?.[day];

  if (
    !todaySchedule ||
    todaySchedule.isOff === true ||
    !todaySchedule.open ||
    !todaySchedule.close
  ) {
    return {
      barberId,
      isAvailable: false,
      status: "OFF_DUTY",
      message: "Barber is not working today",
    };
  }

  const isWorkingNow =
    time >= todaySchedule.open &&
    time < todaySchedule.close;

  if (!isWorkingNow) {
    return {
      barberId,
      isAvailable: false,
      status: "OFF_DUTY",
      message: "Barber is outside working hours",
    };
  }

  // Step 6: Check active booking
  const currentBooking =
    await availabilityRepository.findCurrentBooking(
      barberId,
      new Date()
    );

  if (currentBooking) {
    return {
      barberId,
      isAvailable: false,
      status: "BUSY",
      message: "Barber is currently busy",
    };
  }

  // Step 7: Barber available
  return {
    barberId,
    isAvailable: true,
    status: "AVAILABLE",
    message: "Barber is currently available",
  };
};
