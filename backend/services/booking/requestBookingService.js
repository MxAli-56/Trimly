// services/booking/requestBookingService.js
import * as bookingRepository from "../../repository/bookingRepository.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as serviceRepository from "../../repository/serviceRepository.js";
import Status from "../../model/statusModel.js";

export const requestBookingWithTimer = async (customerId, payload) => {
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
    return false;
  });

  if (activeConflict) throw new Error("SLOT_NOT_AVAILABLE");

  const pendingStatus = await Status.findOne({
    name: "PENDING",
    type: "BOOKING",
  });
  const holdExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

  const booking = await bookingRepository.createPendingBooking({
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
    depositAmount: totalAmount * 0.3,
    isOffPeakBooking: false,
    holdExpiresAt,
  });

  return {
    bookingId: booking._id,
    appointmentCode: booking.appointmentCode,
    holdExpiresAt,
    message: "Booking requested. Barber has 2 minutes to accept.",
  };
};