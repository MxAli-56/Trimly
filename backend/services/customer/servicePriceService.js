
import mongoose from "mongoose";
import * as serviceRepository from "../../repository/serviceRepository.js";

// ==========================================
// API - Get Service Price
// ==========================================

export const getServicePrice = async (serviceId) => {
  // Step 1: Validate Service ID
  if (
    !serviceId ||
    !mongoose.Types.ObjectId.isValid(serviceId)
  ) {
    const error = new Error("Invalid service ID");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Fetch Service Price
  const service =
    await serviceRepository.findServicePriceById(serviceId);

  if (!service) {
    const error = new Error("Service not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 3: Check Price
  if (service.price == null) {
    const error = new Error(
      "Price is not configured for this service"
    );
    error.statusCode = 404;
    throw error;
  }

  // Step 4: Return Service Price
  return {
    serviceId: service._id,
    serviceName: service.name,
    price: service.price,
    duration:
      service.durationMinutes ??
      service.duration ??
      null,
    branchId: service.branchId ?? null,
    categoryId: service.categoryId ?? null,
  };
};
