
import mongoose from "mongoose";

import { findPastBookingsByCustomer } from "../../repository/customer/bookingRepository.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getPastBookings = async (
  userId,
  query = {}
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID");
  }

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw createError("Invalid pagination values");
  }

  const now = new Date();

  // Pakistan local date and time
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  const dateString =
    `${values.year}-${values.month}-${values.day}`;

  const currentTime =
    `${values.hour}:${values.minute}`;

  // Matches existing bookingDate UTC-midnight convention
  const today = new Date(
    `${dateString}T00:00:00.000Z`
  );

  return findPastBookingsByCustomer(
    userId,
    today,
    currentTime,
    { page, limit }
  );
};
