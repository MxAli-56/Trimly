import Review from "../model/reviewModel.js";
import User from "../model/userModel.js";

export const findReviewsByBarberId = async (barberUserId) => {
  return await Review.find({
    barberId: barberUserId,
    deletedAt: null,
  })
    .select(
      "customerId barberId branchId bookingId rating comment createdAt updatedAt"
    )
    .populate("customerId", "name profilePhoto")
    .sort({ createdAt: -1 });
};

// Get reviews for a specific salon
export const findReviewsBySalonId = async (
  branchId,
  skip,
  limit
) => {
  return await Review.find({ branchId })
    .populate("customerId", "name profilePhoto")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Count salon reviews
export const countReviewsBySalonId = async (branchId) => {
  return await Review.countDocuments({ branchId });
};