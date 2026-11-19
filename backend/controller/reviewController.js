import * as reviewService from "../services/review/reviewService.js";

const getAuthUserId = (req) => req.user?.id ?? req.user?._id ?? req.userId;

export const SubmitReview = async (req, res) => {
  try {
    const customerId = getAuthUserId(req);
    if (!customerId) return res.status(401).json({ success: false, message: "Authentication required" });

    const review = await reviewService.submitReview(customerId, req.body);
    
    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review
    });
  } catch (error) {
    if (error.message === "INVALID_BOOKING") return res.status(400).json({ success: false, message: "Booking not found, not completed, or doesn't belong to you" });
    if (error.message === "ALREADY_REVIEWED") return res.status(409).json({ success: false, message: "You have already reviewed this booking" });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const GetMyReviews = async (req, res) => {
  try {
    const barberUserId = getAuthUserId(req);
    if (!barberUserId) return res.status(401).json({ success: false, message: "Authentication required" });

    const result = await reviewService.getBarberReviewsList(barberUserId, req.query);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};