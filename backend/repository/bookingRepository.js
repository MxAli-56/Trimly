import Booking from "../model/bookingModel.js";
import Status from "../model/statusModel.js";
import Payment from "../model/paymentModel.js";

// Terminal statuses — booking slot no longer blocked
const TERMINAL_BOOKING_STATUSES = [
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
  "NO_SHOW",
];

// Find initial booking status
export const findBookingStatus = async (name, type) => {
  return Status.findOne({
    name,
    type,
    deletedAt: null,
  }).lean();
};

// Create booking
export const createBookingRecord = async (data, session = null) => {
  if (session) {
    const [booking] = await Booking.create([data], { session });
    return booking;
  }

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
  })
    .populate("statusId", "name type")
    .lean();
};

// Fetch booking request details for the logged-in barber
export const findBookingRequestDetailsByBarber = async (
  bookingId,
  barberUserId,
) => {
  return Booking.findOne({
    _id: bookingId,
    barberId: barberUserId,
    deletedAt: null,
  })
    .populate("customerId", "name profilePhoto phone")
    .populate("branchId", "name address")
    .populate("statusId", "name type")
    .lean();
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
  todayDateStr,
  currentTimeStr,
  { page = 1, limit = 10 } = {},
) => {
  const today = new Date(`${todayDateStr}T00:00:00.000Z`);

  const filter = {
    customerId,
    deletedAt: null,
    $or: [
      { bookingDate: { $gt: today } },
      {
        bookingDate: today,
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

// Booking status, including hold expiration for frontend countdowns
export const findBookingStatusById = async (bookingId, customerId) => {
  return Booking.findOne({
    _id: bookingId,
    customerId,
    deletedAt: null,
  })
    .select(
      "appointmentCode statusId bookingDate startTime endTime holdExpiresAt",
    )
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
        isActive: false,
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

// Find refund records stored in Payment collection
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

// Find bookings for a barber on a specific date.
// Populate status so availability can distinguish active and inactive bookings.
export const findBookingsForDate = async (barberUserId, dateStart, dateEnd) => {
  return Booking.find({
    barberId: barberUserId,
    bookingDate: {
      $gte: dateStart,
      $lt: dateEnd,
    },
    deletedAt: null,
  })
    .select("startTime endTime statusId holdExpiresAt")
    .populate("statusId", "name type")
    .lean();
};

// Create pending booking with optional MongoDB session
export const createPendingBooking = async (bookingData, session = null) => {
  if (session) {
    const [booking] = await Booking.create([bookingData], { session });
    return booking;
  }

  return Booking.create(bookingData);
};

// Fetch booking details for Socket.IO notification
export const findBookingNotificationById = async (bookingId) => {
  return Booking.findById(bookingId)
    .select(
      "appointmentCode customerId barberId branchId services bookingDate startTime endTime totalAmount holdExpiresAt statusId",
    )
    .populate("customerId", "name profilePhoto")
    .populate("branchId", "name")
    .populate("statusId", "name")
    .lean();
};

export const findActiveBookingsForDay = async (barberUserId, dateString) => {
  const dateStart = new Date(`${dateString}T00:00:00.000Z`);
  const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

  // Status list jinki humein timeline mein dikhani hai (rejected/cancelled nahi)
  const activeStatuses = await Status.find({
    type: "BOOKING",
    name: {
      $in: [
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "PENDING_BARBER",
        "PENDING_CUSTOMER",
        "PENDING_BARBER_APPROVAL",
      ],
    },
  }).select("_id");

  return Booking.find({
    barberId: barberUserId,
    bookingDate: { $gte: dateStart, $lt: dateEnd },
    statusId: { $in: activeStatuses.map((s) => s._id) },
    deletedAt: null,
  })
    .populate("customerId", "name profilePhoto")
    .populate("statusId", "name")
    .sort({ startTime: 1 })
    .lean();
};

export const findBookingByIdAndBarber = async (bookingId, barberUserId) => {
  return Booking.findOne({
    _id: bookingId,
    barberId: barberUserId,
    deletedAt: null,
  }).populate("statusId", "name type");
};

// FIX: Auto-set isActive based on status name (terminal → false)
export const updateBookingStatus = async (bookingId, newStatusId) => {
  const statusDoc = await Status.findById(newStatusId).select("name").lean();
  const isActive = !TERMINAL_BOOKING_STATUSES.includes(statusDoc?.name);

  return Booking.findByIdAndUpdate(
    bookingId,
    { $set: { statusId: newStatusId, isActive } },
    { returnDocument: "after" },
  );
};

export const findUpcomingBookingsByBarber = async (
  barberUserId,
  todayDateStr,
  currentTimeStr,
  statusIds,
  { page = 1, limit = 10 } = {},
) => {
  const today = new Date(`${todayDateStr}T00:00:00.000Z`);

  const filter = {
    barberId: barberUserId,
    deletedAt: null,
    statusId: { $in: statusIds },
    $or: [
      { bookingDate: { $gt: today } },
      {
        bookingDate: today,
        startTime: { $gte: currentTimeStr },
      },
    ],
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("customerId", "name profilePhoto phone")
      .populate("branchId", "name address")
      .populate("statusId", "name")
      .sort({ bookingDate: 1, startTime: 1 })
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

export const findCompletedBookingsByBarber = async (
  barberUserId,
  { page = 1, limit = 10 } = {},
) => {
  const completedStatus = await Status.findOne({
    name: "COMPLETED",
    type: "BOOKING",
  });

  if (!completedStatus) {
    return {
      bookings: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const filter = {
    barberId: barberUserId,
    statusId: completedStatus._id,
    deletedAt: null,
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("customerId", "name profilePhoto")
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

export const findTodayBookingsByBarber = async (barberUserId, todayDate) => {
  const dateStart = new Date(`${todayDate}T00:00:00.000Z`);
  const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

  // Active statuses list
  const activeStatuses = await Status.find({
    type: "BOOKING",
    name: {
      $in: [
        "PENDING",
        "PENDING_BARBER",
        "PENDING_CUSTOMER",
        "PENDING_CUSTOMER_RESCHEDULE",
        "PENDING_BARBER_APPROVAL",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
      ],
    },
  }).select("_id");

  return Booking.find({
    barberId: barberUserId,
    bookingDate: { $gte: dateStart, $lt: dateEnd },
    statusId: { $in: activeStatuses.map((s) => s._id) },
    deletedAt: null,
  })
    .populate("customerId", "name profilePhoto phone")
    .populate("statusId", "name")
    .sort({ startTime: 1 })
    .lean();
};

export const findCompletedBookingById = async (bookingId, customerId) => {
  // Status fetch karo taake ID match ho sake
  const Status = (await import("../model/statusModel.js")).default;
  const completedStatus = await Status.findOne({
    name: "COMPLETED",
    type: "BOOKING",
  });

  if (!completedStatus) {
    return null;
  }

  return Booking.findOne({
    _id: bookingId,
    customerId,
    statusId: completedStatus._id,
    deletedAt: null,
  });
};

export const markBookingAsNoShow = async (bookingId, barberUserId) => {
  const noShowStatus = await Status.findOne({
    name: "NO_SHOW",
    type: "BOOKING",
  });

  if (!noShowStatus) {
    return null;
  }

  return Booking.findOneAndUpdate(
    { _id: bookingId, barberId: barberUserId, deletedAt: null },
    { $set: { statusId: noShowStatus._id, isActive: false } },
    { returnDocument: "after" },
  );
};