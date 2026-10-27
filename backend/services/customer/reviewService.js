import mongoose from "mongoose";
import * as reviewRepository from "../../repository/reviewRepository.js";
import * as barberRepository from "../../repository/barberRepository.js";

export const getBarberReviews = async (barberId) => {
  if (!barberId) {
    const error = new Error("Barber ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    const error = new Error("Invalid barber ID");
    error.statusCode = 400;
    throw error;
  }

  // barberId = BarberProfile ID
  const barber =
    await barberRepository.findBarberById(barberId);

  if (!barber) {
    const error = new Error("Barber not found");
    error.statusCode = 404;
    throw error;
  }

  // Review model stores Barber User ID
  const barberUserId = barber.userId._id
    ? barber.userId._id
    : barber.userId;

  const reviews =
    await reviewRepository.findReviewsByBarberId(
      barberUserId
    );

  return reviews;
};


export const createReview = async (userId, body) => {
  throw new Error("NOT_IMPLEMENTED");
};

export const getMyReviews = async (userId, query = {}) => {
  throw new Error("NOT_IMPLEMENTED");
};

export const getBranchReviews = async (branchId, query = {}) => {
  throw new Error("NOT_IMPLEMENTED");
};