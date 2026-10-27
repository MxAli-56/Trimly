import mongoose from "mongoose";
import * as barberRepository from "../../repository/barberRepository.js";

export const getBranchBarbers = async (branchId, query = {}) => {
  if (!branchId) {
    const error = new Error("Salon ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    const error = new Error("Invalid salon ID");
    error.statusCode = 400;
    throw error;
  }

  const barbers =
    await barberRepository.findBarbersByBranchId(branchId);

  return barbers;
};


// Keep these if customerController already imports them.
// We will implement them in their respective APIs.

export const getBarberById = async (barberId) => {
  throw new Error("NOT_IMPLEMENTED");
};

export const getBarberSchedule = async (barberId) => {
  throw new Error("NOT_IMPLEMENTED");
};