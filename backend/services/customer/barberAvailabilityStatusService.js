import mongoose from "mongoose";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as barberScheduleRepository from "../../repository/barberScheduleRepository.js";
import * as bookingRepository from "../../repository/bookingRepository.js";

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
    parts.map(({ type, value }) => [type, value]),
  );

  return {
    day: values.weekday.toUpperCase(),
    time: `${values.hour}:${values.minute}`,
  };
};

export const getBarberAvailabilityStatus = async (barberProfileId) => {
  if (!mongoose.isValidObjectId(barberProfileId)) {
    throw createError("Invalid barber profile ID", 400);
  }

  const barber =
    await barberProfileRepository.findActiveBarberProfile(barberProfileId);
  if (!barber) throw createError("Barber not found", 404);

  if (barber.isAvailable === false) {
    return {
      barberId: barberProfileId,
      isAvailable: false,
      status: "INACTIVE",
      message: "Barber is currently offline",
    };
  }

  const { day, time } = getKarachiTime();
  const todaySchedule = await barberScheduleRepository.findScheduleByDay(
    barberProfileId,
    day,
  );

  if (!todaySchedule || !todaySchedule.isWorkingDay) {
    return {
      barberId: barberProfileId,
      isAvailable: false,
      status: "OFF_DUTY",
      message: "Barber is not working today",
    };
  }

  const isWorkingNow =
    time >= todaySchedule.startTime && time < todaySchedule.endTime;
  if (!isWorkingNow) {
    return {
      barberId: barberProfileId,
      isAvailable: false,
      status: "OFF_DUTY",
      message: "Barber is outside working hours",
    };
  }

  if (todaySchedule.breakStart && todaySchedule.breakEnd) {
    if (time >= todaySchedule.breakStart && time < todaySchedule.breakEnd) {
      return {
        barberId: barberProfileId,
        isAvailable: false,
        status: "ON_BREAK",
        message: "Barber is on break",
      };
    }
  }

  const currentBooking = await bookingRepository.findCurrentBooking(
    barber.userId,
    new Date(),
  );

  if (currentBooking) {
    return {
      barberId: barberProfileId,
      isAvailable: false,
      status: "BUSY",
      message: "Barber is currently busy with a booking",
    };
  }

  return {
    barberId: barberProfileId,
    isAvailable: true,
    status: "AVAILABLE",
    message: "Barber is currently available",
  };
};

export const getBarberAvailability = async (barberProfileId) => {
  if (!mongoose.isValidObjectId(barberProfileId)) {
    throw createError("Invalid barber profile ID", 400);
  }

  const barber =
    await barberProfileRepository.findBarberProfileForAvailability(
      barberProfileId,
    );
  if (!barber) throw createError("Barber not found", 404);

  const schedules =
    await barberScheduleRepository.findBarberSchedules(barberProfileId);

  return {
    barberId: barber._id,
    branchId: barber.currentBranchId ?? null,
    isAvailable: barber.isAvailable ?? false,
    schedules,
    totalSchedules: schedules.length,
  };
};