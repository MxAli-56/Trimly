
import * as serviceRepository from "../../repository/customer/serviceRepository.js";

// ==========================================
// Get All Services
// ==========================================

export const getAllServices = async (
  page = 1,
  limit = 10
) => {
  // Step 1: Validate pagination
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

  // Step 2: Calculate skip
  const skip = (pageNumber - 1) * limitNumber;

  // Step 3: Fetch services
  const [services, totalServices] = await Promise.all([
    serviceRepository.findAllActiveServices({
      skip,
      limit: limitNumber,
    }),
    serviceRepository.countAllActiveServices(),
  ]);

  // Step 4: Return result
  return {
    services,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalServices,
      totalPages: Math.ceil(totalServices / limitNumber),
    },
  };
};
