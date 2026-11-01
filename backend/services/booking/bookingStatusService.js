
import mongoose from "mongoose";

import { findBookingStatusById } from "../../repository/bookingRepository.js";

import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getBookingStatus = async (
  userId,
  bookingId
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(bookingId)) {
    throw createError("Invalid booking ID");
  }

  const booking = await findBookingStatusById(
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

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    status: booking.statusId.name,
    description: booking.statusId.description,
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
  };
};
