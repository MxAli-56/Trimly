import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import * as bookingRepository from "../../repository/bookingRepository.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as serviceRepository from "../../repository/serviceRepository.js";

import Status from "../../model/statusModel.js";

export const requestBookingWithTimer = async (customerId, payload = {}) => {
  const { barberProfileId, serviceIds, date, startTime } = payload;

  if (!mongoose.isValidObjectId(customerId)) {
    throw new Error("INVALID_CUSTOMER");
  }

  if (!mongoose.isValidObjectId(barberProfileId)) {
    throw new Error("BARBER_NOT_FOUND");
  }

  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new Error("INVALID_SERVICES");
  }

  if (new Set(serviceIds.map(String)).size !== serviceIds.length) {
    throw new Error("INVALID_SERVICES");
  }

  if (!serviceIds.every((id) => mongoose.isValidObjectId(id))) {
    throw new Error("INVALID_SERVICES");
  }

  if (
    typeof startTime !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
  ) {
    throw new Error("INVALID_START_TIME");
  }

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(`${date}T00:00:00.000Z`)) ||
    new Date(`${date}T00:00:00.000Z`)
      .toISOString()
      .slice(0, 10) !== date
  ) {
    throw new Error("INVALID_DATE");
  }

  // Find barber profile
  const barber =
    await barberProfileRepository.findBarberProfile(barberProfileId);

  if (!barber) {
    throw new Error("BARBER_NOT_FOUND");
  }

  // FIX: Database uses branchId, not currentBranchId
  const branchId = barber.currentBranchId;

  if (!branchId || !mongoose.isValidObjectId(branchId)) {
    throw new Error("BARBER_BRANCH_NOT_FOUND");
  }

  // Fetch active services belonging to the barber's branch
  const services = await serviceRepository.findServicesByIds(
    serviceIds,
    branchId
  );

  if (services.length !== serviceIds.length) {
    throw new Error("INVALID_SERVICES");
  }

  let totalDuration = 0;
  let totalAmount = 0;

  const servicesSnapshot = services.map((service) => {
    totalDuration += service.durationMinutes;
    totalAmount += service.price;

    return {
      serviceId: service._id,
      name: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
    };
  });

  if (
    !Number.isFinite(totalDuration) ||
    totalDuration <= 0 ||
    !Number.isFinite(totalAmount)
  ) {
    throw new Error("INVALID_SERVICES");
  }

  // Calculate booking end time
  const [startHour, startMin] = startTime.split(":").map(Number);

  const endTotalMin =
    startHour * 60 + startMin + totalDuration;

  if (endTotalMin > 24 * 60) {
    throw new Error("INVALID_BOOKING_DURATION");
  }

  const endTime =
    `${String(Math.floor(endTotalMin / 60)).padStart(2, "0")}:` +
    `${String(endTotalMin % 60).padStart(2, "0")}`;

  const bookingDate = new Date(`${date}T00:00:00.000Z`);

  // Check existing booking conflicts
  const conflicts = await bookingRepository.findConflictingBookings(
    barber.userId,
    bookingDate,
    startTime,
    endTime
  );

  const activeConflict = conflicts.some((booking) => {
    const statusName = booking.statusId?.name;

    if (
      ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(statusName)
    ) {
      return true;
    }

    if (
      statusName === "PENDING" &&
      booking.holdExpiresAt &&
      new Date(booking.holdExpiresAt) > new Date()
    ) {
      return true;
    }

    return false;
  });

  if (activeConflict) {
    throw new Error("SLOT_NOT_AVAILABLE");
  }

  // Get pending booking status
  const pendingStatus = await Status.findOne({
    name: "PENDING",
    type: "BOOKING",
  });

  if (!pendingStatus) {
    throw new Error("PENDING_STATUS_NOT_FOUND");
  }

  // Barber has 2 minutes to accept
  const holdExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

  const appointmentCode =
    `TRM-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;

  const depositAmount = totalAmount * 0.3;

  // Create booking
  const booking = await bookingRepository.createPendingBooking({
    appointmentCode,
    customerId,
    barberId: barber.userId,
    branchId,
    statusId: pendingStatus._id,
    bookingDate,
    startTime,
    endTime,
    services: servicesSnapshot,
    totalAmount,
    depositAmount,
    isOffPeakBooking: false,
    holdExpiresAt,
  });

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    customerId,
    barberId: barber.userId,
    barberProfileId,
    branchId,
    services: servicesSnapshot,
    date,
    startTime,
    endTime,
    totalDuration,
    totalAmount,
    depositAmount,
    holdExpiresAt,
    status: "PENDING",
    message: "Booking requested. Barber has 2 minutes to accept.",
  };
};