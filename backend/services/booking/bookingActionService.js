import Booking from "../../model/bookingModel.js";
import Status from "../../model/statusModel.js";

const getStatus = async (name, type = "BOOKING") => {
  const status = await Status.findOne({
    name,
    type,
  });

  if (!status) {
    throw new Error(`STATUS_NOT_FOUND_${name}`);
  }

  return status;
};

// ==========================================
// ACCEPT BOOKING
// ==========================================

export const acceptBooking = async (barberUserId, bookingId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    barberId: barberUserId,
    deletedAt: null,
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  // FIX: PENDING_BARBER (not PENDING)
  const pendingStatus = await getStatus("PENDING_BARBER");

  if (String(booking.statusId) !== String(pendingStatus._id)) {
    throw new Error("INVALID_STATE");
  }

  if (!booking.holdExpiresAt || new Date(booking.holdExpiresAt) <= new Date()) {
    const expiredStatus = await getStatus("EXPIRED");

    await Booking.findByIdAndUpdate(
      bookingId,
      {
        statusId: expiredStatus._id,
      },
      {
        returnDocument: "after",
      },
    );

    throw new Error("TIMER_EXPIRED");
  }

  // FIX: PENDING_CUSTOMER (not ACCEPTED)
  const pendingCustomerStatus = await getStatus("PENDING_CUSTOMER");

  // Customer gets 3 minutes to pay deposit
  const newHoldExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      statusId: pendingCustomerStatus._id,
      holdExpiresAt: newHoldExpiresAt,
    },
    {
      returnDocument: "after",
    },
  );

  return {
    bookingId: updatedBooking._id,
    status: "PENDING_CUSTOMER",
    holdExpiresAt: newHoldExpiresAt,
    message: "Booking accepted. Customer has 3 minutes to pay the deposit.",
  };
};

// ==========================================
// REJECT BOOKING
// ==========================================

export const rejectBooking = async (barberUserId, bookingId, reason) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    barberId: barberUserId,
    deletedAt: null,
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  // FIX: PENDING_BARBER (not PENDING)
  const pendingStatus = await getStatus("PENDING_BARBER");

  if (String(booking.statusId) !== String(pendingStatus._id)) {
    throw new Error("INVALID_STATE");
  }

  const rejectedStatus = await getStatus("REJECTED");

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      statusId: rejectedStatus._id,
      cancelReason: reason,
    },
    {
      returnDocument: "after",
    },
  );

  return {
    bookingId: updatedBooking._id,
    status: "REJECTED",
    reason,
    message: "Booking rejected successfully.",
  };
};

// ==========================================
// PAY BOOKING DEPOSIT
// ==========================================

export const payDeposit = async (customerId, bookingId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  });

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  // FIX: PENDING_CUSTOMER (not ACCEPTED)
  const pendingCustomerStatus = await getStatus("PENDING_CUSTOMER");

  if (String(booking.statusId) !== String(pendingCustomerStatus._id)) {
    throw new Error("INVALID_STATE");
  }

  if (!booking.holdExpiresAt || new Date(booking.holdExpiresAt) <= new Date()) {
    const expiredStatus = await getStatus("EXPIRED");

    await Booking.findByIdAndUpdate(
      bookingId,
      {
        statusId: expiredStatus._id,
      },
      {
        returnDocument: "after",
      },
    );

    throw new Error("TIMER_EXPIRED");
  }

  const confirmedStatus = await getStatus("CONFIRMED");

  // Payment confirmation should happen only
  // after the payment provider verifies the deposit.
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      statusId: confirmedStatus._id,
      holdExpiresAt: null,
    },
    {
      returnDocument: "after",
    },
  );

  return {
    bookingId: updatedBooking._id,
    status: "CONFIRMED",
    appointmentCode: updatedBooking.appointmentCode,
    message: "Deposit paid. Booking confirmed.",
  };
};