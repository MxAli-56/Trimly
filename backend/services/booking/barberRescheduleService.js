import mongoose from "mongoose";
import Booking from "../../model/bookingModel.js";
import Status from "../../model/statusModel.js";
import Refund from "../../model/refundModel.js";
import Payment from "../../model/paymentModel.js";
import * as bookingRepository from "../../repository/bookingRepository.js";

const getStatus = async (name) => {
  const status = await Status.findOne({ name, type: "BOOKING" });
  if (!status) throw new Error(`STATUS_NOT_FOUND_${name}`);
  return status;
};

export const barberRescheduleRequest = async (
  barberUserId,
  bookingId,
  newStartTime,
  newEndTime,
) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    barberId: barberUserId,
    deletedAt: null,
  }).populate("statusId");
  if (!booking) throw new Error("BOOKING_NOT_FOUND");

  const validStatuses = [
    "PENDING_BARBER",
    "PENDING_BARBER_APPROVAL",
    "CONFIRMED",
  ];
  if (!validStatuses.includes(booking.statusId.name)) {
    throw new Error("INVALID_STATE");
  }

  const now = new Date();
  const bookingDateTime = new Date(
    `${booking.bookingDate.toISOString().split("T")[0]}T${booking.startTime}:00.000+05:00`,
  );
  const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);

  if (booking.isOffPeakBooking && now > oneHourBefore) {
    throw new Error("TOO_LATE_TO_RESCHEDULE");
  }

  // New time conflict check
  const newDate = new Date(
    `${booking.bookingDate.toISOString().split("T")[0]}T00:00:00.000Z`,
  );
  const conflicts = await bookingRepository.findConflictingBookings(
    barberUserId,
    newDate,
    newStartTime,
    newEndTime,
  );

  const activeConflict = conflicts.some(
    (c) =>
      String(c._id) !== String(bookingId) &&
      [
        "CONFIRMED",
        "PENDING_BARBER",
        "PENDING_CUSTOMER",
        "PENDING_BARBER_APPROVAL",
        "IN_PROGRESS",
      ].includes(c.statusId?.name),
  );
  if (activeConflict) throw new Error("NEW_SLOT_NOT_AVAILABLE");

  const rescheduleStatus = await getStatus("PENDING_CUSTOMER_RESCHEDULE");

  let newHoldExpiresAt;
  if (booking.isOffPeakBooking) {
    // Off-peak: Customer has until 1 hour before the NEW booking time
    const newBookingDateTime = new Date(
      `${booking.bookingDate.toISOString().split("T")[0]}T${newStartTime}:00.000+05:00`,
    );
    newHoldExpiresAt = new Date(newBookingDateTime.getTime() - 60 * 60 * 1000);
  } else {
    // Working hours: Customer has 5 minutes to respond
    newHoldExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  }

  const updated = await Booking.findByIdAndUpdate(
    bookingId,
    {
      statusId: rescheduleStatus._id,
      holdExpiresAt: newHoldExpiresAt,
      rescheduleProposedStartTime: newStartTime,
      rescheduleProposedEndTime: newEndTime,
    },
    { returnDocument: "after" },
  );

  return { message: "Reschedule request sent to customer.", data: updated };
};

export const customerRespondToReschedule = async (
  customerId,
  bookingId,
  action,
) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  }).populate("statusId");
  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (booking.statusId.name !== "PENDING_CUSTOMER_RESCHEDULE")
    throw new Error("INVALID_STATE");

  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    throw new Error("RESCHEDULE_REQUEST_EXPIRED");
  }

  if (action === "ACCEPT") {
    if (booking.isOffPeakBooking) {
      // Off-peak: Already paid, so just confirm with new time
      const confirmedStatus = await getStatus("CONFIRMED");
      await Booking.findByIdAndUpdate(bookingId, {
        statusId: confirmedStatus._id,
        startTime: booking.rescheduleProposedStartTime,
        endTime: booking.rescheduleProposedEndTime,
        holdExpiresAt: null,
        rescheduleProposedStartTime: null,
        rescheduleProposedEndTime: null,
      });
      return { message: "Reschedule accepted. Booking confirmed." };
    } else {
      // Working hours: Not paid yet, so go to PENDING_CUSTOMER (waiting for payment)
      const pendingCustomerStatus = await getStatus("PENDING_CUSTOMER");
      const newHoldExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 mins to pay
      await Booking.findByIdAndUpdate(bookingId, {
        statusId: pendingCustomerStatus._id,
        startTime: booking.rescheduleProposedStartTime,
        endTime: booking.rescheduleProposedEndTime,
        holdExpiresAt: newHoldExpiresAt,
        rescheduleProposedStartTime: null,
        rescheduleProposedEndTime: null,
      });
      return {
        message:
          "Reschedule accepted. Please pay the 30% deposit within 3 minutes.",
      };
    }
  }

  if (action === "REJECT") {
    const cancelledStatus = await getStatus("CANCELLED");

    if (booking.isOffPeakBooking) {
      // Off-peak: Paid, refund needed
      await Booking.findByIdAndUpdate(bookingId, {
        statusId: cancelledStatus._id,
        holdExpiresAt: null,
      });

      const refundStatus = await Status.findOne({
        name: "PENDING",
        type: "REFUND",
      });
      const payment = await Payment.findOne({ bookingId: booking._id });
      if (payment) {
        await Refund.create({
          bookingId: booking._id,
          paymentId: payment._id,
          amount: booking.depositAmount,
          reason: "Customer rejected reschedule",
          statusId: refundStatus._id,
        });
      }
      return {
        message: "Reschedule rejected. Booking cancelled and deposit refunded.",
      };
    } else {
      // Working hours: Not paid, just cancel
      await Booking.findByIdAndUpdate(bookingId, {
        statusId: cancelledStatus._id,
        holdExpiresAt: null,
      });
      return { message: "Reschedule rejected. Booking cancelled." };
    }
  }
};