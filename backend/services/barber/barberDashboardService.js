import mongoose from "mongoose";
import Status from "../../model/statusModel.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as barberScheduleRepository from "../../repository/barberScheduleRepository.js";
import * as barberLeaveRepository from "../../repository/barberLeaveRepository.js";
import * as bookingRepository from "../../repository/bookingRepository.js";
import { calculateCustomerRiskScore } from "../customer/riskStoreService.js"; 

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

  const timeline = [];
  const [startHour, startMin] = schedule.startTime.split(":").map(Number);
  const [endHour, endMin] = schedule.endTime.split(":").map(Number);

  let currentMin = startHour * 60 + startMin;
  const endLimit = endHour * 60 + endMin;

  while (currentMin < endLimit) {
    const timeStr = `${String(Math.floor(currentMin / 60)).padStart(2, "0")}:${String(currentMin % 60).padStart(2, "0")}`;

    const isOnLeave = dayLeaves.some(
      (l) => timeStr >= l.startTime && timeStr < l.endTime,
    );
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
      const [bh, bm] = booking.endTime.split(":").map(Number);
      currentMin = bh * 60 + bm;
      continue;
    } else {
      timeline.push({ time: timeStr, status: "AVAILABLE" });
    }
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
  if (!mongoose.isValidObjectId(barberUserId))
    throw new Error("INVALID_BARBER_ID");

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

  const result = await bookingRepository.findUpcomingBookingsByBarber(
    barberUserId,
    karachiDate,
    currentTime,
    statusIds,
    { page, limit },
  );

  // Inject Risk Scores into upcoming bookings
  const bookingsWithRisk = await Promise.all(
    result.bookings.map(async (b) => {
      const riskScore = await calculateCustomerRiskScore(b.customerId?._id);
      return { ...b, riskScore };
    }),
  );

  return { ...result, bookings: bookingsWithRisk };
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

  // Inject Risk Scores into today's appointments
  const appointmentsWithRisk = await Promise.all(
    bookings.map(async (b) => {
      const riskScore = await calculateCustomerRiskScore(b.customerId?._id);
      return { ...b, riskScore };
    }),
  );

  return {
    date: todayDate,
    total: bookings.length,
    appointments: appointmentsWithRisk,
  };
};