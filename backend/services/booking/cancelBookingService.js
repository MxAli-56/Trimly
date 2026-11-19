import mongoose from "mongoose";
import {
  findBookingStatus,
  findBookingForCancellation,
  updateBookingCancellation,
} from "../../repository/bookingRepository.js";
import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const cancelBooking = async (userId, bookingId, payload = {}) => {
  if (!mongoose.isValidObjectId(userId))
    throw createError("Invalid customer ID", 401);
  if (!mongoose.isValidObjectId(bookingId))
    throw createError("Invalid booking ID");

  const reason =
    typeof payload.reason === "string" ? payload.reason.trim() : "";
  if (!reason || reason.length > 500)
    throw createError("Cancellation reason must be 1 to 500 characters");

  const booking = await findBookingForCancellation(bookingId, userId);
  if (!booking) throw createError("Booking not found", 404);

  const currentStatus = booking.statusId?.name;
  if (booking.statusId?.type !== STATUS_TYPES.BOOKING)
    throw createError("Invalid booking status", 409);

  if (currentStatus === "CANCELLED")
    throw createError("Booking already cancelled", 409);
  if (currentStatus === "COMPLETED")
    throw createError("Completed booking cannot be cancelled", 409);

  if (
    !["PENDING", "PENDING_BARBER", "PENDING_CUSTOMER", "CONFIRMED"].includes(
      currentStatus,
    )
  ) {
    throw createError("Booking cannot be cancelled in its current status", 409);
  }

  const bookingDate = booking.bookingDate.toISOString().slice(0, 10);
  const appointmentStart = new Date(
    `${bookingDate}T${booking.startTime}:00+05:00`,
  );

  if (appointmentStart <= new Date())
    throw createError("Cannot cancel a booking after its start time", 409);

  // --- LATE CANCEL LOGIC ---
  const diffInMinutes = (appointmentStart - new Date()) / (1000 * 60);
  let finalReason = reason || "Cancelled by customer";

  // Agar 1 ghante (60 mins) ya kam bacha hai
  if (diffInMinutes <= 60 && diffInMinutes > 0) {
    finalReason = "LATE_CANCEL: " + finalReason;
  }

  const cancelledStatus = await findBookingStatus(
    "CANCELLED",
    STATUS_TYPES.BOOKING,
  );
  if (!cancelledStatus)
    throw createError("CANCELLED booking status not found in database", 500);

  const updatedBooking = await updateBookingCancellation(
    bookingId,
    userId,
    booking.statusId._id,
    cancelledStatus._id,
    finalReason,
  );

  if (!updatedBooking)
    throw createError("Booking status changed. Please try again", 409);

  return {
    bookingId: updatedBooking._id,
    appointmentCode: updatedBooking.appointmentCode,
    status: updatedBooking.statusId.name,
    cancelReason: updatedBooking.cancelReason,
    message: "Booking cancelled successfully",
  };
};