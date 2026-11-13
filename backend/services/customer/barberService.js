import mongoose from "mongoose";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";

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

  const barbers = await barberProfileRepository.findBarbersByBranchId(branchId);

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

  const barber = await barberProfileRepository.findBarberById(barberId);

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