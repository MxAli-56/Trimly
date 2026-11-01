
import * as serviceRepository from "../../repository/serviceRepository.js";

// ==========================================
// Search Services
// ==========================================

export const searchServices = async (
  searchText,
  page = 1,
  limit = 10
) => {
  // Step 1: Validate search text
  if (
    typeof searchText !== "string" ||
    !searchText.trim()
  ) {
    const error = new Error("Search text is required");
    error.statusCode = 400;
    throw error;
  }

  const query = searchText.trim();

  if (query.length > 100) {
    const error = new Error(
      "Search text must not exceed 100 characters"
    );
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

  // Step 3: Calculate pagination
  const skip = (pageNumber - 1) * limitNumber;

  // Step 4: Search services
  const [services, totalServices] = await Promise.all([
    serviceRepository.searchActiveServices({
      searchText: query,
      skip,
      limit: limitNumber,
    }),
    serviceRepository.countSearchActiveServices(query),
  ]);

  // Step 5: Return result
  return {
    searchText: query,
    services,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalServices,
      totalPages: Math.ceil(totalServices / limitNumber),
    },
  };
};
