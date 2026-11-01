
import mongoose from "mongoose";

import {
  findBookingForRefundStatus,
  findRefundPaymentsByBooking,
} from "../../repository/bookingRepository.js";

import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getRefundStatus = async (
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

  // 2. Find customer's booking
  const booking = await findBookingForRefundStatus(
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
    throw createError("Invalid booking status", 409);
  }

  // 3. Refund is relevant after cancellation
  if (booking.statusId.name !== "CANCELLED") {
    return {
      bookingId: booking._id,
      appointmentCode: booking.appointmentCode,
      bookingStatus: booking.statusId.name,
      refundStatus: "NOT_APPLICABLE",
      refundAmount: null,
      message: "Booking has not been cancelled",
    };
  }

  // 4. Check payment records
  const payments = await findRefundPaymentsByBooking(
    bookingId
  );

  if (payments === null) {
    throw createError(
      "Payment model is not registered",
      500
    );
  }

  // Only records with an explicit REFUND status
  const refundPayment = payments.find(
    (payment) =>
      payment.statusId?.type === STATUS_TYPES.REFUND
  );

  if (!refundPayment) {
    return {
      bookingId: booking._id,
      appointmentCode: booking.appointmentCode,
      bookingStatus: "CANCELLED",
      refundStatus: "NOT_INITIATED",
      refundAmount: null,
      message: "No refund record found",
    };
  }

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    bookingStatus: "CANCELLED",
    refundStatus: refundPayment.statusId.name,
    refundAmount: refundPayment.amount ?? null,
    refundRecordId: refundPayment._id,
    lastUpdatedAt: refundPayment.updatedAt,
    message: "Refund status retrieved successfully",
  };
};
