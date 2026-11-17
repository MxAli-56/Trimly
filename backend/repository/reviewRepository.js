import Review from "../model/reviewModel.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";

// Get reviews for a specific salon (Branch Profile)
export const findReviewsBySalonId = async (branchId, skip, limit) => {
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

// Get Rating Stats for a Barber (Header UI ke liye)
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
        fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
      },
    },
  ]);
};

// Check for duplicate review
export const findReviewByBookingId = async (bookingId) => {
  return await Review.findOne({ bookingId, deletedAt: null });
};

// Create new review
export const createReviewRecord = async (reviewData) => {
  return await Review.create(reviewData);
};

// Get Paginated Reviews for Barber Dashboard (Replaces the redundant findReviewsByBarberId)
export const findReviewsForBarber = async (
  barberUserId,
  { page = 1, limit = 10 },
) => {
  const filter = { barberId: barberUserId, deletedAt: null };
  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("customerId", "name profilePhoto")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);
  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
};