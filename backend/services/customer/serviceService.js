import mongoose from "mongoose";
import * as serviceRepository from "../../repository/serviceRepository.js";

export const getBranchServices = async (
  branchId,
  query = {},
) => {
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

  const services =
    await serviceRepository.findServicesByBranchId(branchId);

  return services;
};

// Keep these because customerController already imports them.
// We will implement them separately in their respective APIs.

export const getBranchCategories = async (branchId) => {
  throw new Error("NOT_IMPLEMENTED");
};


export const getServiceById = async (
  branchId,
  serviceId,
) => {
  // Check branch ID
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

  // Check service ID
  if (!serviceId) {
    const error = new Error("Service ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    const error = new Error("Invalid service ID");
    error.statusCode = 400;
    throw error;
  }

  // Find service
  const service =
    await serviceRepository.findServiceById(
      branchId,
      serviceId,
    );

  // Service not found
  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    throw error;
  }

  return service;
};