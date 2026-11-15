import Joi from "joi";

const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createBookingSchema = Joi.object({
  barberProfileId: Joi.string()
    .required()
    .messages({ "any.required": "Barber ID is required" }),
  serviceIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({ "any.required": "At least one service is required" }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ "string.pattern.base": "Date must be YYYY-MM-DD" }),
  startTime: Joi.string()
    .pattern(timePattern)
    .required()
    .messages({ "string.pattern.base": "Time must be HH:MM" }),
});

export const offPeakBookingSchema = createBookingSchema; // Same fields for off-peak