
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



export const findBookingsByCustomer = async (
  customerId,
  { page = 1, limit = 10 } = {}
) => {
  const skip = (page - 1) * limit;

  const filter = {
    customerId,
    deletedAt: null,
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("branchId", "name address")
      .populate("barberId", "name profilePhoto")
      .populate("statusId", "name type")
      .sort({ bookingDate: -1, startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
