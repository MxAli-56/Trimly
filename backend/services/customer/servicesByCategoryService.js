
import mongoose from "mongoose";
import * as serviceRepository from "../../repository/customer/serviceRepository.js";

// ==========================================
// Get Services By Category
// ==========================================

export const getServicesByCategory = async (
  categoryId,
  page = 1,
  limit = 10
) => {
  // Step 1: Validate category ID
  if (
    !categoryId ||
    !mongoose.Types.ObjectId.isValid(categoryId)
  ) {
    const error = new Error("Invalid category ID");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Validate pagination
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(limitNumber) ||
    limitNumber < 1 ||
    limitNumber > 100
  ) {
    const error = new Error(
      "Page must be >= 1 and limit must be between 1 and 100"
    );
    error.statusCode = 400;
    throw error;
  }

  // Step 3: Calculate skip
  const skip = (pageNumber - 1) * limitNumber;

  // Step 4: Fetch category services
  const [services, totalServices] = await Promise.all([
    serviceRepository.findServicesByCategory({
      categoryId,
      skip,
      limit: limitNumber,
    }),
    serviceRepository.countServicesByCategory(categoryId),
  ]);

  // Step 5: Return response
  return {
    categoryId,
    services,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalServices,
      totalPages: Math.ceil(totalServices / limitNumber),
    },
  };
};
