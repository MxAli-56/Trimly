import Review from "../model/reviewModel.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";

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


export const getBarberRatingStats = async (barberId) => {
  return await Review.aggregate([
    {
      $match: {
        barberId: new mongoose.Types.ObjectId(barberId),
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: "$barberId",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        fiveStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 5] }, 1, 0],
          },
        },
        fourStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 4] }, 1, 0],
          },
        },
        threeStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 3] }, 1, 0],
          },
        },
        twoStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 2] }, 1, 0],
          },
        },
        oneStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 1] }, 1, 0],
          },
        },
      },
    },
  ]);
};


