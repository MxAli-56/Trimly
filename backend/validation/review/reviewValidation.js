import Joi from "joi";

export const createReviewSchema = Joi.object({
  bookingId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Booking ID format",
      "any.required": "Booking ID is required",
    }),
  rating: Joi.number().min(1).max(5).required().messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot be more than 5",
    "any.required": "Rating is required",
  }),
  comment: Joi.string().allow("", null).optional(),
});