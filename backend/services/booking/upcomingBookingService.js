import mongoose from "mongoose";
import { findUpcomingBookingsByCustomer } from "../../repository/bookingRepository.js";

export const getUpcomingBookings = async (userId, query = {}) => {
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

  const now = new Date();

  // Get Karachi Date and Time as Strings
  const karachiDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // Output: YYYY-MM-DD

  const currentTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now); // Output: HH:mm

  const result = await findUpcomingBookingsByCustomer(
    userId,
    karachiDate,
    currentTime,
    { page, limit },
  );

  return result;
};