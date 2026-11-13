
import mongoose from "mongoose";
import * as reviewRepository from "../../repository/customer/reviewRepository.js";
import * as barberRepository from "../../repository/customer/barberRepository.js";

// ==========================================
// Get Barber Rating
// ==========================================

export const getBarberRating = async (barberId) => {
  // Step 1: Validate Barber ID
  if (
    !barberId ||
    !mongoose.Types.ObjectId.isValid(barberId)
  ) {
    const error = new Error("Invalid barber ID");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Check Barber Existence
  const barber =
    await barberRepository.findBarberById(barberId);

  if (!barber) {
    const error = new Error("Barber not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 3: Fetch Rating Statistics
  const stats =
    await reviewRepository.getBarberRatingStats(barberId);

  const rating = stats[0];

  // Step 4: Return Rating Data
  return {
    barberId,
    averageRating: rating
      ? Number(rating.averageRating.toFixed(1))
      : 0,
    totalRatings: rating?.totalRatings ?? 0,
    ratingBreakdown: {
      5: rating?.fiveStar ?? 0,
      4: rating?.fourStar ?? 0,
      3: rating?.threeStar ?? 0,
      2: rating?.twoStar ?? 0,
      1: rating?.oneStar ?? 0,
    },
  };
};
