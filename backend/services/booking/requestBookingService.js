
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import * as bookingRepository from "../../repository/bookingRepository.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as serviceRepository from "../../repository/serviceRepository.js";

import {
  getBookingStatusId,
  expireOverdueBookings,
} from "./bookingTimerService.js";

export const requestBookingWithTimer = async (customerId, payload = {}) => {
  const { barberProfileId, serviceIds, date, startTime } = payload;

  if (!mongoose.isValidObjectId(customerId)) {
    throw new Error("INVALID_CUSTOMER");
  }

  if (!mongoose.isValidObjectId(barberProfileId)) {
    throw new Error("BARBER_NOT_FOUND");
  }

  if (
    !Array.isArray(serviceIds) ||
    serviceIds.length === 0 ||
    new Set(serviceIds.map(String)).size !== serviceIds.length ||
    !serviceIds.every((id) => mongoose.isValidObjectId(id))
  ) {
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
    new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date
  ) {
    throw new Error("INVALID_DATE");
  }

  const barber =
    await barberProfileRepository.findBarberProfile(barberProfileId);

  if (!barber) {
    throw new Error("BARBER_NOT_FOUND");
  }

  const branchId = barber.branchId;

  if (!branchId) {
    throw new Error("BARBER_BRANCH_NOT_FOUND");
  }

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

  const [hour, minute] = startTime.split(":").map(Number);
  const endMinutes = hour * 60 + minute + totalDuration;

  if (endMinutes >= 1440) {
    throw new Error("INVALID_BOOKING_DURATION");
  }

  const endTime =
    `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:` +
    `${String(endMinutes % 60).padStart(2, "0")}`;

  const bookingDate = new Date(`${date}T00:00:00.000Z`);

  // Reject appointment times that have already passed.
  const appointmentTimestamp =
    Date.parse(`${date}T${startTime}:00+05:00`);

  if (
    !Number.isFinite(appointmentTimestamp) ||
    appointmentTimestamp <= Date.now()
  ) {
    throw new Error("INVALID_DATE");
  }

  // Mark old pending/accepted bookings as expired.
  await expireOverdueBookings();

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

    if (["PENDING", "ACCEPTED"].includes(statusName)) {
      return (
        booking.holdExpiresAt &&
        new Date(booking.holdExpiresAt) > new Date()
      );
    }

    return false;
  });

  if (activeConflict) {
    throw new Error("SLOT_NOT_AVAILABLE");
  }

  const pendingStatusId = await getBookingStatusId("PENDING");

  const holdExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

  const depositAmount = Math.round(totalAmount * 0.3 * 100) / 100;

  const appointmentCode =
    `TRM-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;

  const booking = await bookingRepository.createPendingBooking({
    appointmentCode,
    customerId,
    barberId: barber.userId,
    branchId,
    statusId: pendingStatusId,
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
    timerSeconds: 120,
    status: "PENDING",
    message: "Booking requested. Barber has 2 minutes to accept.",
  };
};
