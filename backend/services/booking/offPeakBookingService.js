// services/booking/offPeakBookingService.js
import Booking from "../../model/bookingModel.js";
import Status from "../../model/statusModel.js";
import Payment from "../../model/paymentModel.js";
import Refund from "../../model/refundModel.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as serviceRepository from "../../repository/serviceRepository.js";

const getStatus = async (name) => {
  const status = await Status.findOne({ name, type: "BOOKING" });
  if (!status) throw new Error(`STATUS_NOT_FOUND_${name}`);
  return status;
};

export const createOffPeakBooking = async (customerId, payload) => {
  const { barberProfileId, serviceIds, date, startTime } = payload;

  const barber =
    await barberProfileRepository.findBarberProfile(barberProfileId);
  if (!barber) throw new Error("BARBER_NOT_FOUND");

  const services = await serviceRepository.findServicesByIds(serviceIds);
  if (services.length !== serviceIds.length)
    throw new Error("INVALID_SERVICES");

  let totalDuration = 0;
  let totalAmount = 0;
  const servicesSnapshot = services.map((s) => {
    totalDuration += s.durationMinutes;
    totalAmount += s.price;
    return {
      serviceId: s._id,
      name: s.name,
      price: s.price,
      durationMinutes: s.durationMinutes,
    };
  });

  const [startHour, startMin] = startTime.split(":").map(Number);
  const endTotalMin = startHour * 60 + startMin + totalDuration;
  const endTime = `${String(Math.floor(endTotalMin / 60)).padStart(2, "0")}:${String(endTotalMin % 60).padStart(2, "0")}`;

  const bookingDate = new Date(`${date}T00:00:00.000Z`);

const conflicts = await bookingRepository.findConflictingBookings(
  barber.userId,
  bookingDate,
  startTime,
  endTime,
);

const activeConflict = conflicts.some((c) => {
  const statusName = c.statusId?.name;
  if (["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(statusName))
    return true;
  if (statusName === "PENDING" && c.holdExpiresAt > new Date()) return true;
  // Off-peak pending approval wali bhi block karegi agar woh future ka same slot hai
  if (statusName === "PENDING_BARBER_APPROVAL") return true;
  return false;
});

if (activeConflict) throw new Error("SLOT_NOT_AVAILABLE");

  const pendingStatus = await getStatus("PENDING_BARBER_APPROVAL");
  const depositAmount = totalAmount * 0.3;

  // 1. Create Booking
  const booking = await Booking.create({
    appointmentCode: `TRM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    customerId,
    barberId: barber.userId,
    branchId: barber.currentBranchId,
    statusId: pendingStatus._id,
    bookingDate,
    startTime,
    endTime,
    services: servicesSnapshot,
    totalAmount,
    depositAmount,
    isOffPeakBooking: true,
    holdExpiresAt: null, // No timer here
  });

  // 2. Create Payment Record (Simulate immediate 30% payment)
  await Payment.create({
    bookingId: booking._id,
    customerId,
    amount: depositAmount,
    provider: "MOCK_JAZZCASH",
    status: "SUCCESS",
    transactionId: `TXN-${Date.now()}`,
  });

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    message: "Off-peak booking paid and pending barber approval.",
  };
};

export const barberRespondToOffPeak = async (
  barberUserId,
  bookingId,
  action,
  reason = null,
) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    barberId: barberUserId,
    isOffPeakBooking: true,
    deletedAt: null,
  }).populate("statusId");

  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (booking.statusId.name !== "PENDING_BARBER_APPROVAL")
    throw new Error("INVALID_STATE");

  // Check 1 hour rule
  const bookingDateTime = new Date(
    `${booking.bookingDate.toISOString().split("T")[0]}T${booking.startTime}:00.000+05:00`,
  );
  const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);

  if (new Date() > oneHourBefore) {
    throw new Error("TOO_LATE_TO_ACT"); // Passed the 1 hour window
  }

  if (action === "ACCEPT") {
    const confirmedStatus = await getStatus("CONFIRMED");
    await Booking.findByIdAndUpdate(
      bookingId,
      { statusId: confirmedStatus._id },
      { returnDocument: "after" },
    );
    return { message: "Off-peak booking confirmed successfully." };
  }

  if (action === "REJECT") {
    const rejectedStatus = await getStatus("REJECTED");
    await Booking.findByIdAndUpdate(
      bookingId,
      { statusId: rejectedStatus._id, cancelReason: reason },
      { returnDocument: "after" },
    );

    // Create Refund Record
    const refundStatus = await Status.findOne({
      name: "PENDING",
      type: "REFUND",
    });
    await Refund.create({
      bookingId: booking._id,
      paymentId: (await Payment.findOne({ bookingId: booking._id }))._id,
      amount: booking.depositAmount,
      reason: reason,
      statusId: refundStatus._id,
    });

    return { message: "Booking rejected and 30% deposit refund initiated." };
  }

  throw new Error("INVALID_ACTION");
};