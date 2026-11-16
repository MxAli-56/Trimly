import mongoose from "mongoose";
import Status from "../../model/statusModel.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as barberScheduleRepository from "../../repository/barberScheduleRepository.js";
import * as barberLeaveRepository from "../../repository/barberLeaveRepository.js";
import * as bookingRepository from "../../repository/bookingRepository.js";

export const getBarberDailyTimeline = async (barberUserId, dateString) => {
  const profile =
    await barberProfileRepository.findProfileByUserId(barberUserId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  const [year, month, day] = dateString.split("-").map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));

  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const dayOfWeek = days[dateObj.getUTCDay()];

  const schedule = await barberScheduleRepository.findScheduleByDay(
    profile._id,
    dayOfWeek,
  );
  if (!schedule || !schedule.isWorkingDay) {
    return { date: dateString, isWorkingDay: false, timeline: [] };
  }

  const leaves = await barberLeaveRepository.findLeavesByProfileId(profile._id);
  const dayLeaves = leaves.filter(
    (l) => new Date(l.leaveDate).toISOString().split("T")[0] === dateString,
  );

  const bookings = await bookingRepository.findActiveBookingsForDay(
    barberUserId,
    dateString,
  );

  // Timeline Generation logic
  const timeline = [];
  const [startHour, startMin] = schedule.startTime.split(":").map(Number);
  const [endHour, endMin] = schedule.endTime.split(":").map(Number);

  let currentMin = startHour * 60 + startMin;
  const endLimit = endHour * 60 + endMin;

  while (currentMin < endLimit) {
    const timeStr = `${String(Math.floor(currentMin / 60)).padStart(2, "0")}:${String(currentMin % 60).padStart(2, "0")}`;

    // 1. Check Leave
    const isOnLeave = dayLeaves.some(
      (l) => timeStr >= l.startTime && timeStr < l.endTime,
    );

    // 2. Check Booking
    const booking = bookings.find(
      (b) => timeStr >= b.startTime && timeStr < b.endTime,
    );

    if (isOnLeave) {
      timeline.push({ time: timeStr, status: "ON_LEAVE" });
    } else if (booking) {
      timeline.push({
        time: timeStr,
        status: booking.statusId.name,
        bookingId: booking._id,
        customerName: booking.customerId?.name || "Customer",
        customerPhoto: booking.customerId?.profilePhoto || null,
        services: booking.services.map((s) => s.name).join(", "),
        endTime: booking.endTime,
      });
      // Jump the pointer to the end of this booking
      const [bh, bm] = booking.endTime.split(":").map(Number);
      currentMin = bh * 60 + bm;
      continue;
    } else {
      timeline.push({ time: timeStr, status: "AVAILABLE" });
    }

    // Increment by 30 mins (ya jo bhi slot size ho)
    currentMin += 30;
  }

  return {
    date: dateString,
    isWorkingDay: true,
    workingHours: { start: schedule.startTime, end: schedule.endTime },
    totalBookings: bookings.length,
    timeline,
  };
};

export const getBarberUpcomingBookings = async (barberUserId, query = {}) => {
  if (!mongoose.isValidObjectId(barberUserId)) {
    throw new Error("INVALID_BARBER_ID");
  }

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new Error("INVALID_PAGINATION");
  }

  // Sirf active statuses fetch karo
  const activeStatuses = await Status.find({
    type: "BOOKING",
    name: {
      $in: [
        "PENDING_BARBER",
        "PENDING_CUSTOMER",
        "PENDING_CUSTOMER_RESCHEDULE",
        "PENDING_BARBER_APPROVAL",
        "CONFIRMED",
        "IN_PROGRESS",
      ],
    },
  }).select("_id");

  const statusIds = activeStatuses.map((s) => s._id);

  // Karachi time nikaalo
  const now = new Date();
  const karachiDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const currentTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);

  return await bookingRepository.findUpcomingBookingsByBarber(
    barberUserId,
    karachiDate,
    currentTime,
    statusIds,
    { page, limit },
  );
};

export const getCompletedBookings = async (barberUserId, query = {}) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  return await bookingRepository.findCompletedBookingsByBarber(barberUserId, {
    page,
    limit,
  });
};

export const getTodayAppointments = async (barberUserId) => {
  const now = new Date();
  const todayDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const bookings = await bookingRepository.findTodayBookingsByBarber(
    barberUserId,
    todayDate,
  );

  return {
    date: todayDate,
    total: bookings.length,
    appointments: bookings,
  };
};