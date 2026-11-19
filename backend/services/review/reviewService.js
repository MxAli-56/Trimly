import * as bookingRepository from "../../repository/bookingRepository.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as reviewRepository from "../../repository/reviewRepository.js";

export const submitReview = async (customerId, payload) => {
  const { bookingId, rating, comment } = payload;

  // 1. Check booking is valid, COMPLETED, and belongs to this customer
  const booking = await bookingRepository.findCompletedBookingById(
    bookingId,
    customerId,
  );
  if (!booking) {
    throw new Error("INVALID_BOOKING");
  }

  // 2. Check for duplicate review
  const existingReview =
    await reviewRepository.findReviewByBookingId(bookingId);
  if (existingReview) {
    throw new Error("ALREADY_REVIEWED");
  }

  // 3. Create the Review
  const newReview = await reviewRepository.createReviewRecord({
    bookingId,
    customerId,
    barberId: booking.barberId,
    branchId: booking.branchId,
    rating,
    comment,
  });

  // 4. Atomic Update Barber Rating
  const barberProfile = await barberProfileRepository.findProfileByUserId(
    booking.barberId,
  );
  if (barberProfile) {
    await barberProfileRepository.atomicUpdateBarberRating(
      barberProfile._id,
      rating,
    );
  }

  return newReview;
};

export const getBarberReviewsList = async (barberUserId, query = {}) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  const result = await reviewRepository.findReviewsForBarber(barberUserId, {
    page,
    limit,
  });

  // Header ke liye stats calculate karo (On-the-fly, no cron)
  const stats = await reviewRepository.getBarberRatingStats(barberUserId);

  return {
    ...result,
    stats: stats[0] || {
      averageRating: 0,
      totalRatings: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    },
  };
};