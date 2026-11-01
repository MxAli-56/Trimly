
import Booking from "../model/bookingModel.js";
import Status from "../model/statusModel.js";

// Find initial booking status
export const findBookingStatus = async (name, type) => {
  return Status.findOne({
    name,
    type,
    deletedAt: null,
  }).lean();
};

// Create booking
export const createBookingRecord = async (data) => {
  return Booking.create(data);
};

// Find overlapping bookings
export const findOverlappingBookings = async ({
  barberUserId,
  dateStart,
  dateEnd,
  startTime,
  endTime,
}) => {
  return Booking.find({
    barberId: barberUserId,
    bookingDate: {
      $gte: dateStart,
      $lt: dateEnd,
    },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    deletedAt: null,
  }).lean();
};




export const findBookingStatuses = async () => {
  return Status.find({
    type: "BOOKING",
    deletedAt: null,
  }).lean();
};