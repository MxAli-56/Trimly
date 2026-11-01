import mongoose from "mongoose";
import { findBookingsByCustomer } from "../../repository/bookingRepository.js";
import { findBookingByIdAndCustomer } from "../../repository/bookingRepository.js";


export const getMyBookings = async (userId, query = {}) => {
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
    const error = new Error(
      "Page must be >= 1 and limit must be between 1 and 100"
    );
    error.statusCode = 400;
    throw error;
  }

  return findBookingsByCustomer(userId, {
    page,
    limit,
  });
};

export const getBookingById = async (userId, bookingId) => {
  if (!mongoose.isValidObjectId(userId)) {
    const error = new Error("Invalid customer ID");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.isValidObjectId(bookingId)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }

  const booking = await findBookingByIdAndCustomer(
    bookingId,
    userId
  );

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  return booking;
};


