
import mongoose from "mongoose";

import { getBarberAvailability } from "../customer/availabilityService.js";

import {
  findBookingForReschedule,
  updateBookingReschedule,
  findOverlappingBookings,
} from "../../repository/customer/bookingRepository.js";

import { STATUS_TYPES } from "../../config/status.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const rescheduleBooking = async (
  userId,
  bookingId,
  payload = {}
) => {
  const { date, startTime } = payload;

  // 1. Validate IDs
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(bookingId)) {
    throw createError("Invalid booking ID");
  }

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(
      new Date(`${date}T00:00:00.000Z`).getTime()
    )
  ) {
    throw createError("Invalid date (YYYY-MM-DD)");
  }

  if (
    typeof startTime !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
  ) {
    throw createError("Invalid startTime (HH:mm)");
  }

  // 2. Fetch booking
  const booking = await findBookingForReschedule(
    bookingId,
    userId
  );

  if (!booking) {
    throw createError("Booking not found", 404);
  }

  if (booking.statusId?.type !== STATUS_TYPES.BOOKING) {
    throw createError("Invalid booking status", 409);
  }

  if (
    !["PENDING", "CONFIRMED"].includes(
      booking.statusId.name
    )
  ) {
    throw createError(
      "Booking cannot be rescheduled in its current status",
      409
    );
  }

  // 3. Check existing appointment has not started
  const oldDate = booking.bookingDate
    .toISOString()
    .slice(0, 10);

  const oldStart = new Date(
    `${oldDate}T${booking.startTime}:00+05:00`
  );

  if (oldStart <= new Date()) {
    throw createError(
      "Cannot reschedule an appointment that has started",
      409
    );
  }

  // 4. Read existing service
  // This API currently supports single-service bookings
  if (booking.services?.length !== 1) {
    throw createError(
      "Rescheduling multi-service bookings is not supported"
    );
  }

  const serviceId = booking.services[0].serviceId;

  if (!serviceId) {
    throw createError("Booking service not found", 404);
  }

  // Booking.barberId references User, not BarberProfile
  const BarberProfile = (
    await import("../../model/barberProfileModel.js")
  ).default;

  const barberProfile = await BarberProfile.findOne({
    userId: booking.barberId,
    branchId: booking.branchId,
    deletedAt: null,
  }).lean();

  if (!barberProfile) {
    throw createError("Barber profile not found", 404);
  }

  // 5. Validate requested slot
  const availability = await getBarberAvailability(
    String(barberProfile._id),
    { date, serviceId: String(serviceId) }
  );

  const selectedSlot = (
    availability.availableSlots ?? []
  ).find((slot) => slot.startTime === startTime);

  if (!selectedSlot) {
    throw createError(
      "Selected slot is not available",
      409
    );
  }

  // 6. Check conflicts excluding current booking
  const bookingDate = new Date(
    `${date}T00:00:00.000Z`
  );

  const dateEnd = new Date(
    bookingDate.getTime() + 86400000
  );

  const conflicts = await findOverlappingBookings({
    barberUserId: booking.barberId,
    dateStart: bookingDate,
    dateEnd,
    startTime,
    endTime: selectedSlot.endTime,
  });

  const otherConflicts = conflicts.filter(
    (item) => String(item._id) !== String(bookingId)
  );

  if (otherConflicts.length > 0) {
    throw createError(
      "Selected slot is already booked",
      409
    );
  }

  // 7. Update booking
  const updatedBooking = await updateBookingReschedule(
    bookingId,
    userId,
    booking.statusId._id,
    {
      bookingDate,
      startTime,
      endTime: selectedSlot.endTime,
    }
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
    oldDate,
    oldStartTime: booking.startTime,
    newDate: date,
    newStartTime: updatedBooking.startTime,
    newEndTime: updatedBooking.endTime,
    message: "Booking rescheduled successfully",
  };
};
