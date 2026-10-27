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