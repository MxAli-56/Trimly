import Status from "../../model/statusModel.js";
import * as bookingRepository from "../../repository/bookingRepository.js";
import * as userRepository from "../../repository/userRepository.js";

const getStatus = async (name) => {
  const status = await Status.findOne({ name, type: "BOOKING" });
  if (!status) throw new Error(`STATUS_NOT_FOUND_${name}`);
  return status;
};

export const startService = async (barberUserId, bookingId) => {
  const booking = await bookingRepository.findBookingByIdAndBarber(
    bookingId,
    barberUserId,
  );
  if (!booking) throw new Error("BOOKING_NOT_FOUND");

  if (booking.statusId.name !== "CONFIRMED") {
    throw new Error("INVALID_STATE"); // Sirf CONFIRMED booking start ho sakti hai
  }

  const inProgressStatus = await getStatus("IN_PROGRESS");
  await bookingRepository.updateBookingStatus(bookingId, inProgressStatus._id);

  return {
    bookingId,
    status: "IN_PROGRESS",
    message: "Service started successfully.",
  };
};

export const completeService = async (barberUserId, bookingId) => {
  const booking = await bookingRepository.findBookingByIdAndBarber(
    bookingId,
    barberUserId,
  );
  if (!booking) throw new Error("BOOKING_NOT_FOUND");

  if (booking.statusId.name !== "IN_PROGRESS") {
    throw new Error("INVALID_STATE"); // Pehle start karna zaroori hai
  }

  const completedStatus = await getStatus("COMPLETED");
  await bookingRepository.updateBookingStatus(bookingId, completedStatus._id);

  // Loyalty Points: +1 per 100 PKR
  const pointsEarned = Math.floor(booking.totalAmount / 100);
  if (pointsEarned > 0) {
    await userRepository.incrementLoyaltyPoints(
      booking.customerId,
      pointsEarned,
    );
  }

  // TODO: Trigger n8n webhook for review request (FYP-2)

  return {
    bookingId,
    status: "COMPLETED",
    pointsAwarded: pointsEarned,
    message: `Service completed. Customer earned ${pointsEarned} loyalty points.`,
  };
};