
import mongoose from "mongoose";

import { findBookingForCancellation } from "../../repository/customer/bookingRepository.js";

import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const checkCancellationEligibility = async (
  userId,
  bookingId
) => {
  // 1. Validate IDs
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(bookingId)) {
    throw createError("Invalid booking ID");
  }

  // 2. Fetch customer's booking
  const booking = await findBookingForCancellation(
    bookingId,
    userId
  );

  if (!booking) {
    throw createError("Booking not found", 404);
  }

  const status = booking.statusId?.name;

  // 3. Validate booking status
  if (booking.statusId?.type !== STATUS_TYPES.BOOKING) {
    throw createError("Invalid booking status", 409);
  }

  let eligible = true;
  let reason = "Booking can be cancelled";

  // 4. Check status
  if (status === "CANCELLED") {
    eligible = false;
    reason = "Booking is already cancelled";
  } else if (status === "COMPLETED") {
    eligible = false;
    reason = "Completed booking cannot be cancelled";
  } else if (!["PENDING", "CONFIRMED"].includes(status)) {
    eligible = false;
    reason = "Booking cannot be cancelled in its current status";
  }

  // 5. Check appointment start time
  const date = booking.bookingDate
    .toISOString()
    .slice(0, 10);

  const appointmentStart = new Date(
    `${date}T${booking.startTime}:00+05:00`
  );

  if (eligible && appointmentStart <= new Date()) {
    eligible = false;
    reason = "Appointment has already started";
  }

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    status,
    eligible,
    reason,
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
  };
};
