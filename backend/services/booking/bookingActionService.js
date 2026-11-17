
import Booking from "../../model/bookingModel.js";

import {
  getBookingStatusId,
  expireBookingIfNeeded,
} from "./bookingTimerService.js";

const findBooking = async (filter) => {
  const booking = await Booking.findOne({
    ...filter,
    deletedAt: null,
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  return booking;
};

export const acceptBooking = async (barberUserId, bookingId) => {
  const booking = await findBooking({
    _id: bookingId,
    barberId: barberUserId,
  });

  await expireBookingIfNeeded(bookingId);

  const pendingId = await getBookingStatusId("PENDING");
  const acceptedId = await getBookingStatusId("ACCEPTED");

  if (String(booking.statusId) !== String(pendingId)) {
    throw new Error("INVALID_STATE");
  }

  const newHoldExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

  const updatedBooking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      barberId: barberUserId,
      statusId: pendingId,
      holdExpiresAt: { $gt: new Date() },
      deletedAt: null,
    },
    {
      $set: {
        statusId: acceptedId,
        holdExpiresAt: newHoldExpiresAt,
      },
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedBooking) {
    throw new Error("TIMER_EXPIRED");
  }

  return {
    bookingId: updatedBooking._id,
    status: "ACCEPTED",
    holdExpiresAt: updatedBooking.holdExpiresAt,
    timerSeconds: 180,
    message: "Booking accepted. Customer has 3 minutes to pay.",
  };
};

export const rejectBooking = async (
  barberUserId,
  bookingId,
  reason
) => {
  const booking = await findBooking({
    _id: bookingId,
    barberId: barberUserId,
  });

  await expireBookingIfNeeded(bookingId);

  const pendingId = await getBookingStatusId("PENDING");
  const rejectedId = await getBookingStatusId("REJECTED");

  if (String(booking.statusId) !== String(pendingId)) {
    throw new Error("INVALID_STATE");
  }

  const updatedBooking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      barberId: barberUserId,
      statusId: pendingId,
      holdExpiresAt: { $gt: new Date() },
      deletedAt: null,
    },
    {
      $set: {
        statusId: rejectedId,
        holdExpiresAt: null,
        cancelReason: reason || "Rejected by barber",
      },
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedBooking) {
    throw new Error("TIMER_EXPIRED");
  }

  return {
    bookingId: updatedBooking._id,
    status: "REJECTED",
    reason: updatedBooking.cancelReason,
    message: "Booking rejected successfully.",
  };
};

export const payDeposit = async (customerId, bookingId) => {
  if (process.env.ENABLE_DEMO_PAYMENTS !== "true") {
    const error = new Error(
      "Payment gateway verification is not configured"
    );
    error.statusCode = 503;
    throw error;
  }

  const booking = await findBooking({
    _id: bookingId,
    customerId,
  });

  await expireBookingIfNeeded(bookingId);

  const acceptedId = await getBookingStatusId("ACCEPTED");
  const confirmedId = await getBookingStatusId("CONFIRMED");

  if (String(booking.statusId) !== String(acceptedId)) {
    throw new Error("INVALID_STATE");
  }

  const updatedBooking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      customerId,
      statusId: acceptedId,
      holdExpiresAt: { $gt: new Date() },
      deletedAt: null,
    },
    {
      $set: {
        statusId: confirmedId,
        holdExpiresAt: null,
      },
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedBooking) {
    throw new Error("TIMER_EXPIRED");
  }

  return {
    bookingId: updatedBooking._id,
    status: "CONFIRMED",
    appointmentCode: updatedBooking.appointmentCode,
    totalAmount: updatedBooking.totalAmount,
    depositAmount: updatedBooking.depositAmount,
    paymentMode: "DEMO",
    message: "Demo payment completed. Booking confirmed.",
  };
};
