// services/booking/bookingActionService.js
import Booking from "../../model/bookingModel.js";
import Status from "../../model/statusModel.js";

const getStatus = async (name, type) => {
  const status = await Status.findOne({ name, type });
  if (!status) throw new Error(`STATUS_NOT_FOUND_${name}`);
  return status;
};

export const acceptBooking = async (barberUserId, bookingId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    barberId: barberUserId,
    deletedAt: null,
  });
  if (!booking) throw new Error("BOOKING_NOT_FOUND");

  const pendingStatus = await getStatus("PENDING", "BOOKING");
  if (String(booking.statusId) !== String(pendingStatus._id)) {
    throw new Error("INVALID_STATE"); 
  }

  if (booking.holdExpiresAt < new Date()) {
    const expiredStatus = await getStatus("EXPIRED", "BOOKING");
    await Booking.findByIdAndUpdate(
      bookingId,
      { statusId: expiredStatus._id },
      { returnDocument: "after" },
    );
    throw new Error("TIMER_EXPIRED");
  }

  const acceptedStatus = await getStatus("ACCEPTED", "BOOKING");
  const newHoldExpiresAt = new Date(Date.now() + 3 * 60 * 1000); 

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { statusId: acceptedStatus._id, holdExpiresAt: newHoldExpiresAt },
    { returnDocument: "after" },
  );

  return {
    bookingId: updatedBooking._id,
    status: "ACCEPTED",
    holdExpiresAt: newHoldExpiresAt,
    message: "Booking accepted. Customer has 3 minutes to pay the deposit.",
  };
};

export const rejectBooking = async (barberUserId, bookingId, reason) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    barberId: barberUserId,
    deletedAt: null,
  });
  if (!booking) throw new Error("BOOKING_NOT_FOUND");

  const pendingStatus = await getStatus("PENDING", "BOOKING");
  if (String(booking.statusId) !== String(pendingStatus._id)) {
    throw new Error("INVALID_STATE");
  }

  const rejectedStatus = await getStatus("REJECTED", "BOOKING");
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { statusId: rejectedStatus._id, cancelReason: reason },
    { returnDocument: "after" },
  );

  return {
    bookingId: updatedBooking._id,
    status: "REJECTED",
    reason,
    message: "Booking rejected successfully.",
  };
};

export const payDeposit = async (customerId, bookingId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  });
  if (!booking) throw new Error("BOOKING_NOT_FOUND");

  const acceptedStatus = await getStatus("ACCEPTED", "BOOKING");
  if (String(booking.statusId) !== String(acceptedStatus._id)) {
    throw new Error("INVALID_STATE"); 
  }

  if (booking.holdExpiresAt < new Date()) {
    const expiredStatus = await getStatus("EXPIRED", "BOOKING");
    await Booking.findByIdAndUpdate(
      bookingId,
      { statusId: expiredStatus._id },
      { returnDocument: "after" },
    );
    throw new Error("TIMER_EXPIRED");
  }

  const confirmedStatus = await getStatus("CONFIRMED", "BOOKING");
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      statusId: confirmedStatus._id,
      holdExpiresAt: null, 
    },
    { returnDocument: "after" },
  );

  return {
    bookingId: updatedBooking._id,
    status: "CONFIRMED",
    appointmentCode: updatedBooking.appointmentCode,
    message: "Deposit paid. Booking confirmed.",
  };
};