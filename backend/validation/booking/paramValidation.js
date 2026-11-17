import Joi from "joi";

export const bookingIdParamSchema = Joi.object({
  bookingId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Booking ID format",
    }),
});