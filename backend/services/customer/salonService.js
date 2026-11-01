import mongoose from "mongoose";
import * as reviewRepository from "../../repository/reviewRepository.js";
import * as branchRepository from "../../repository/branchRepository.js";


export const getSalons = async (query = {}) => {
  const filters = {};

  if (query.city) {
    filters.city = query.city.trim();
  }

  if (query.area) {
    filters.area = query.area.trim();
  }

  if (query.isOpen !== undefined) {
    filters.isOpen = query.isOpen === "true";
  }

  const salons =
    await branchRepository.findAllActiveBranches(filters);

  return salons;
};

export const searchSalons = async (searchText) => {
  if (!searchText || !searchText.trim()) {
    const error = new Error("Search text is required");
    error.statusCode = 400;
    throw error;
  }

  const salons = await branchRepository.searchBranches(
    searchText.trim(),
  );

  return salons;
};

export const filterSalonsByArea = async (area) => {
  if (!area || !area.trim()) {
    const error = new Error("Area is required");
    error.statusCode = 400;
    throw error;
  }

  const salons =
    await branchRepository.findBranchesByArea(area.trim());

  return salons;
};

export const getSalonById = async (branchId) => {
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

  const salon =
    await branchRepository.findBranchById(branchId);

  if (!salon) {
    const error = new Error("Salon not found");
    error.statusCode = 404;
    throw error;
  }

  return salon;
};

export const getSalonReviews = async (
  branchId,
  page = 1,
  limit = 10
) => {
  // Step 1: Validate salon ID
  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    const error = new Error("Invalid salon ID");
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

  // Step 3: Verify salon exists
  const salon = await branchRepository.findSalonOpeningHoursById(
    branchId
  );

  if (!salon) {
    const error = new Error("Salon not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 4: Calculate pagination
  const skip = (pageNumber - 1) * limitNumber;

  // Step 5: Fetch reviews
  const [reviews, totalReviews] = await Promise.all([
    reviewRepository.findReviewsBySalonId(
      branchId,
      skip,
      limitNumber
    ),
    reviewRepository.countReviewsBySalonId(branchId),
  ]);

  // Step 6: Return response
  return {
    salonId: salon._id,
    salonName: salon.name,
    avgRating: salon.avgRating ?? null,
    ratingCount: salon.ratingCount ?? totalReviews,
    reviews,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limitNumber),
    },
  };
};