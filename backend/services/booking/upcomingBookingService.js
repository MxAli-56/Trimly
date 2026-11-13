
import mongoose from "mongoose";

import { findUpcomingBookingsByCustomer } from "../../repository/customer/bookingRepository.js";

export const getUpcomingBookings = async (
  userId,
  query = {}
) => {
  if (!mongoose.isValidObjectId(userId)) {
    const error = new Error("Invalid customer ID");
    error.statusCode = 400;
    throw error;
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
    const error = new Error("Invalid pagination values");
    error.statusCode = 400;
    throw error;
  }

  // Current date/time in Pakistan
  const now = new Date();

  const karachiDate = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(now);

  const today = new Date(
    `${karachiDate}T00:00:00.000Z`
  );

  const result = await findUpcomingBookingsByCustomer(
    userId,
    today,
    { page, limit }
  );

  // Exclude past times on current date
  const currentTime = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }
  ).format(now);

  const upcoming = result.bookings.filter((booking) => {
    const bookingDay = booking.bookingDate
      .toISOString()
      .slice(0, 10);

    if (bookingDay > karachiDate) return true;

    return booking.startTime >= currentTime;
  });

  return {
    bookings: upcoming,
    total: upcoming.length,
    page,
    limit,
  };
};
