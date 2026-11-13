import mongoose from "mongoose";
import * as branchRepository from "../../repository/customer/branchRepository.js";

export const getSalonOpeningHours = async (branchId) => {
  // Step 1: Validate salon ID
  if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
    const error = new Error("Invalid salon ID");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Find salon
  const salon =
    await branchRepository.findSalonOpeningHoursById(branchId);

  if (!salon) {
    const error = new Error("Salon not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 3: Get salon opening hours
  const openingHours =
    salon.openingHours ??
    salon.workingHours ??
    salon.businessHours;

  if (openingHours == null) {
    const error = new Error(
      "Opening hours are not configured for this salon"
    );
    error.statusCode = 404;
    throw error;
  }

  // Step 4: Return response
  return {
    salonId: salon._id,
    salonName: salon.name,
    openingHours,
  };
};