import Booking from "../model/bookingModel.js";
import Status from "../model/statusModel.js";
import Payment from "../model/paymentModel.js";

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
  { page = 1, limit = 10 } = {},
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

export const findBookingByIdAndCustomer = async (bookingId, customerId) => {
  return Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  })
    .populate("branchId", "name address")
    .populate("barberId", "name profilePhoto")
    .populate("statusId", "name type")
    .populate("services.serviceId", "name price durationMinutes")
    .lean();
};

export const findUpcomingBookingsByCustomer = async (
  customerId,
  todayDateStr, // e.g., "2026-11-14"
  currentTimeStr, // e.g., "14:30"
  { page = 1, limit = 10 } = {},
) => {
  const today = new Date(`${todayDateStr}T00:00:00.000Z`);

  const filter = {
    customerId,
    deletedAt: null,
    $or: [
      { bookingDate: { $gt: today } }, // Future dates
      {
        bookingDate: today, // Aaj ki date hai, toh check time
        startTime: { $gte: currentTimeStr },
      },
    ],
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("branchId", "name address")
      .populate("barberId", "name profilePhoto")
      .populate("statusId", "name type")
      .sort({ bookingDate: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Booking.countDocuments(filter), // Count ab bilkul accurate hoga
  ]);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const findPastBookingsByCustomer = async (
  customerId,
  today,
  currentTime,
  { page = 1, limit = 10 } = {},
) => {
  const filter = {
    customerId,
    deletedAt: null,
    $or: [
      { bookingDate: { $lt: today } },
      {
        bookingDate: today,
        endTime: { $lte: currentTime },
      },
    ],
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("branchId", "name address")
      .populate("barberId", "name profilePhoto")
      .populate("statusId", "name type")
      .sort({ bookingDate: -1, startTime: -1 })
      .skip((page - 1) * limit)
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

export const findBookingStatusById = async (bookingId, customerId) => {
  return Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  })
    .select("appointmentCode statusId bookingDate startTime endTime")
    .populate("statusId", "name type description")
    .lean();
};

export const findBookingAppointmentCode = async (bookingId, customerId) => {
  return Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  })
    .select("appointmentCode bookingDate startTime endTime statusId")
    .populate("statusId", "name type")
    .lean();
};

export const findBookingForCancellation = async (bookingId, customerId) => {
  return Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  })
    .populate("statusId", "name type")
    .lean();
};

export const updateBookingCancellation = async (
  bookingId,
  customerId,
  expectedStatusId,
  cancelledStatusId,
  reason,
) => {
  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      customerId,
      statusId: expectedStatusId,
      deletedAt: null,
    },
    {
      $set: {
        statusId: cancelledStatusId,
        cancelReason: reason,
      },
    },
    { new: true, runValidators: true },
  )
    .populate("statusId", "name type")
    .lean();
};

export const findBookingForReschedule = async (bookingId, customerId) => {
  return Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  })
    .populate("statusId", "name type")
    .lean();
};

export const updateBookingReschedule = async (
  bookingId,
  customerId,
  expectedStatusId,
  data,
) => {
  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      customerId,
      statusId: expectedStatusId,
      deletedAt: null,
    },
    {
      $set: {
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("statusId", "name type")
    .lean();
};

export const findBookingCancellationDetails = async (bookingId, customerId) => {
  return Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  })
    .select(
      "appointmentCode bookingDate startTime endTime " +
        "statusId cancelReason totalAmount depositAmount " +
        "branchId barberId updatedAt",
    )
    .populate("statusId", "name type description")
    .populate("branchId", "name address")
    .populate("barberId", "name profilePhoto")
    .lean();
};

export const findBookingForRefundStatus = async (bookingId, customerId) => {
  return Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  })
    .select("appointmentCode statusId totalAmount depositAmount")
    .populate("statusId", "name type")
    .lean();
};

// Payment collection mein stored refund records
export const findRefundPaymentsByBooking = async (bookingId) => {
  return Payment.find({
    bookingId,
    deletedAt: null,
  })
    .populate("statusId", "name type")
    .sort({ createdAt: -1 })
    .lean();
};

export const findCurrentBooking = async (barberUserId, currentDateTime) => {
  const statuses = await Status.find({
    name: { $in: ["CONFIRMED", "IN_PROGRESS"] },
    type: "BOOKING",
    deletedAt: null,
  })
    .select("_id")
    .lean();

  const statusIds = statuses.map((s) => s._id);

  const today = new Date(currentDateTime);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const currentTime = `${String(currentDateTime.getHours()).padStart(2, "0")}:${String(currentDateTime.getMinutes()).padStart(2, "0")}`;

  return Booking.findOne({
    barberId: barberUserId,
    bookingDate: { $gte: today, $lt: tomorrow },
    statusId: { $in: statusIds },
    startTime: { $lte: currentTime },
    endTime: { $gt: currentTime },
    deletedAt: null,
  }).lean();
};

export const findBookingsForDate = async (barberUserId, dateStart, dateEnd) => {
  return await Booking.find({
    barberId: barberUserId,
    bookingDate: {
      $gte: dateStart,
      $lt: dateEnd,
    },
    deletedAt: null,
  })
    .select("startTime endTime statusId holdExpiresAt")
    .lean();
};

export const createPendingBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

export const findConflictingBookings = async (barberUserId, date, startTime, endTime) => {
  return await Booking.find({
    barberId: barberUserId,
    bookingDate: date,
    deletedAt: null,
    $or: [
      { statusId: { $ne: null } }, 
      { 
        holdExpiresAt: { $gt: new Date() } 
      }
    ],
    $and: [
      { startTime: { $lt: endTime } },
      { endTime: { $gt: startTime } }
    ]
  }).populate("statusId").lean();
};