
import mongoose from "mongoose";

import { findBookingAppointmentCode } from "../../repository/bookingRepository.js";

import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getAppointmentCode = async (
  userId,
  bookingId
) => {
  // Validate customer ID
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID", 401);
  }

  // Validate booking ID
  if (!mongoose.isValidObjectId(bookingId)) {
    throw createError("Invalid booking ID");
  }

  // Fetch customer's booking
  const booking = await findBookingAppointmentCode(
    bookingId,
    userId
  );

  if (!booking) {
    throw createError("Booking not found", 404);
  }

  if (
    !booking.statusId ||
    booking.statusId.type !== STATUS_TYPES.BOOKING
  ) {
    throw createError("Booking status not found", 404);
  }

  if (!booking.appointmentCode) {
    throw createError("Appointment code not found", 404);
  }

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    status: booking.statusId.name,
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
  };
};
