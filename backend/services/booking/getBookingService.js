import mongoose from "mongoose";
import { findBookingsByCustomer } from "../../repository/bookingRepository.js";



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
  // TODO: Find booking and verify customer ownership.
  throw new Error("NOT_IMPLEMENTED");
};


