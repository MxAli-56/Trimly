
import mongoose from "mongoose";

import { findBookingForCancellation } from "../../repository/bookingRepository.js";

import { checkCancellationEligibility } from "./cancellationEligibilityService.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const calculateRefund = async (
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

  // 2. Check cancellation eligibility
  const eligibility = await checkCancellationEligibility(
    userId,
    bookingId
  );

  // 3. Get booking
  const booking = await findBookingForCancellation(
    bookingId,
    userId
  );

  if (!booking) {
    throw createError("Booking not found", 404);
  }

  // 4. Calculate estimated refund
  const depositAmount = booking.depositAmount ?? 0;

  if (
    typeof depositAmount !== "number" ||
    !Number.isFinite(depositAmount) ||
    depositAmount < 0
  ) {
    throw createError("Invalid booking deposit amount", 500);
  }

  const refundPercentage = eligibility.eligible ? 100 : 0;

  const refundAmount = Number(
    (
      (depositAmount * refundPercentage) /
      100
    ).toFixed(2)
  );

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    bookingStatus: booking.statusId?.name,
    totalAmount: booking.totalAmount,
    depositAmount,
    cancellationEligible: eligibility.eligible,
    refundPercentage,
    estimatedRefundAmount: refundAmount,
    currency: "PKR",
    reason: eligibility.reason,
    message: eligibility.eligible
      ? "Estimated refund calculated successfully"
      : "Booking is not eligible for cancellation",
  };
};
