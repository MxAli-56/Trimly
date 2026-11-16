import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { getBarberAvailability } from "../customer/availabilityService.js";
import {
  findBookingStatus,
  createBookingRecord,
  findOverlappingBookings,
} from "../../repository/bookingRepository.js";

import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as serviceRepository from "../../repository/serviceRepository.js";

import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createBooking = async (userId, payload = {}) => {
  const { barberId, serviceId, date, startTime } = payload;

  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(barberId)) {
    throw createError("Invalid barber ID");
  }

  if (!mongoose.isValidObjectId(serviceId)) {
    throw createError("Invalid service ID");
  }

  if (
    typeof startTime !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
  ) {
    throw createError("Invalid startTime (HH:mm)");
  }

  const availability = await getBarberAvailability(barberId, {
    date,
    serviceId,
  });

  const selectedSlot = (availability.availableSlots ?? []).find(
    (slot) => slot.startTime === startTime,
  );

  if (!selectedSlot) {
    throw createError("Selected slot is not available", 409);
  }

  const barber = await barberProfileRepository.findBarberProfile(barberId);
  const service = await serviceRepository.findActiveService(serviceId);

  if (!barber || !service) {
    throw createError("Barber or service not found", 404);
  }

  if (String(barber.currentBranchId) !== String(service.branchId)) {
    throw createError("Service does not belong to barber's branch");
  }

  const status = await findBookingStatus("PENDING", STATUS_TYPES.BOOKING);

  if (!status) {
    throw createError("PENDING booking status not found in database", 500);
  }

  const bookingDate = new Date(`${date}T00:00:00.000Z`);
  const dateEnd = new Date(bookingDate.getTime() + 86400000);

  const conflicts = await findOverlappingBookings({
    barberUserId: barber.userId,
    dateStart: bookingDate,
    dateEnd,
    startTime,
    endTime: selectedSlot.endTime,
  });

  if (conflicts.length > 0) {
    throw createError("Slot already booked", 409);
  }

  const totalAmount = service.price;
  const depositAmount = 0;

  const appointmentCode = `TRM-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;

  const booking = await createBookingRecord({
    appointmentCode,
    customerId: userId,
    barberId: barber.userId,
    branchId: barber.currentBranchId, // branchId -> currentBranchId
    statusId: status._id,
    bookingDate,
    startTime,
    endTime: selectedSlot.endTime,
    services: [
      {
        serviceId: service._id,
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
      },
    ],
    totalAmount,
    depositAmount,
    isOffPeakBooking: false,
  });

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    status: status.name,
    barberId,
    serviceId,
    date,
    startTime,
    endTime: selectedSlot.endTime,
    totalAmount,
    depositAmount,
    message: "Booking created successfully",
  };
};