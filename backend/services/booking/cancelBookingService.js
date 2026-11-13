
import mongoose from "mongoose";

import {
  findBookingStatus,
  findBookingForCancellation,
  updateBookingCancellation,
} from "../../repository/customer/bookingRepository.js";

import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const cancelBooking = async (
  userId,
  bookingId,
  payload = {}
) => {
  // 1. Validate IDs
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(bookingId)) {
    throw createError("Invalid booking ID");
  }

  // 2. Validate cancellation reason
  const reason =
    typeof payload.reason === "string"
      ? payload.reason.trim()
      : "";

  if (!reason || reason.length > 500) {
    throw createError(
      "Cancellation reason must be 1 to 500 characters"
    );
  }

  // 3. Fetch customer's booking
  const booking = await findBookingForCancellation(
    bookingId,
    userId
  );

  if (!booking) {
    throw createError("Booking not found", 404);
  }

  const currentStatus = booking.statusId?.name;

  if (booking.statusId?.type !== STATUS_TYPES.BOOKING) {
    throw createError("Invalid booking status", 409);
  }

  // 4. Check cancellation eligibility
  if (currentStatus === "CANCELLED") {
    throw createError("Booking already cancelled", 409);
  }

  if (currentStatus === "COMPLETED") {
    throw createError(
      "Completed booking cannot be cancelled",
      409
    );
  }

  if (!["PENDING", "CONFIRMED"].includes(currentStatus)) {
    throw createError(
      "Booking cannot be cancelled in its current status",
      409
    );
  }

  // 5. Prevent cancellation after appointment start
  const bookingDate = booking.bookingDate
    .toISOString()
    .slice(0, 10);

  const appointmentStart = new Date(
    `${bookingDate}T${booking.startTime}:00+05:00`
  );

  if (appointmentStart <= new Date()) {
    throw createError(
      "Cannot cancel a booking after its start time",
      409
    );
  }

  // 6. Find CANCELLED status
  const cancelledStatus = await findBookingStatus(
    "CANCELLED",
    STATUS_TYPES.BOOKING
  );

  if (!cancelledStatus) {
    throw createError(
      "CANCELLED booking status not found in database",
      500
    );
  }

  // 7. Update booking
  const updatedBooking = await updateBookingCancellation(
    bookingId,
    userId,
    booking.statusId._id,
    cancelledStatus._id,
    reason
  );

  if (!updatedBooking) {
    throw createError(
      "Booking status changed. Please try again",
      409
    );
  }

  return {
    bookingId: updatedBooking._id,
    appointmentCode: updatedBooking.appointmentCode,
    status: updatedBooking.statusId.name,
    cancelReason: updatedBooking.cancelReason,
    message: "Booking cancelled successfully",
  };
};
