
import Booking from "../../model/bookingModel.js";
import Status from "../../model/statusModel.js";

export const getBookingStatusId = async (name) => {
  const status = await Status.findOne({
    name,
    type: "BOOKING",
    deletedAt: null,
  });

  if (!status) {
    throw new Error(`STATUS_NOT_FOUND_${name}`);
  }

  return status._id;
};

export const expireBookingIfNeeded = async (bookingId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    deletedAt: null,
  }).populate("statusId", "name");

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  const statusName = booking.statusId?.name;

  if (!["PENDING", "ACCEPTED"].includes(statusName)) {
    return booking;
  }

  if (
    !booking.holdExpiresAt ||
    booking.holdExpiresAt.getTime() > Date.now()
  ) {
    return booking;
  }

  const expiredStatusId = await getBookingStatusId("EXPIRED");

  const updated = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      statusId: booking.statusId._id,
      holdExpiresAt: { $lte: new Date() },
      deletedAt: null,
    },
    {
      $set: {
        statusId: expiredStatusId,
        holdExpiresAt: null,
      },
    },
    { returnDocument: "after" }
  );

  return updated || Booking.findById(bookingId);
};

export const expireOverdueBookings = async () => {
  const pendingStatusId = await getBookingStatusId("PENDING");
  const acceptedStatusId = await getBookingStatusId("ACCEPTED");
  const expiredStatusId = await getBookingStatusId("EXPIRED");

  return Booking.updateMany(
    {
      statusId: {
        $in: [pendingStatusId, acceptedStatusId],
      },
      holdExpiresAt: { $lte: new Date() },
      deletedAt: null,
    },
    {
      $set: {
        statusId: expiredStatusId,
        holdExpiresAt: null,
      },
    }
  );
};
