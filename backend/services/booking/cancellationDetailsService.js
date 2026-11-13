
import mongoose from "mongoose";

import { findBookingCancellationDetails } from "../../repository/customer/bookingRepository.js";

import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getCancellationDetails = async (
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
  const booking = await findBookingCancellationDetails(
    bookingId,
    userId
  );

  if (!booking) {
    throw createError("Booking not found", 404);
  }

  // 3. Validate booking status
  if (
    !booking.statusId ||
    booking.statusId.type !== STATUS_TYPES.BOOKING
  ) {
    throw createError("Invalid booking status", 409);
  }

  // 4. Only cancelled bookings
  if (booking.statusId.name !== "CANCELLED") {
    throw createError(
      "This booking has not been cancelled",
      409
    );
  }

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    status: booking.statusId.name,
    cancellationReason: booking.cancelReason ?? null,

    originalAppointment: {
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
    },

    salon: booking.branchId,
    barber: booking.barberId,

    payment: {
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount,
      currency: "PKR",
    },

    // This is the booking update timestamp,
    // not a dedicated cancellation timestamp.
    lastUpdatedAt: booking.updatedAt,

    message: "Cancellation details retrieved successfully",
  };
};
