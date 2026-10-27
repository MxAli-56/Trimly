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


export const getBarberById = async (barberId) => {
  if (!barberId) {
    const error = new Error("Barber ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    const error = new Error("Invalid barber ID");
    error.statusCode = 400;
    throw error;
  }

  const barber =
    await barberRepository.findBarberById(barberId);

  if (!barber) {
    const error = new Error("Barber not found");
    error.statusCode = 404;
    throw error;
  }

  return barber;
};

export const getBarberSchedule = async (barberId) => {
  throw new Error("NOT_IMPLEMENTED");
};