import Joi from "joi";

const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const rejectBookingSchema = Joi.object({
  reason: Joi.string()
    .min(3)
    .required()
    .messages({ "any.required": "Rejection reason is required" }),
});

export const offPeakActionSchema = Joi.object({
  action: Joi.string().valid("ACCEPT", "REJECT").required(),
  reason: Joi.string().when("action", {
    is: "REJECT",
    then: Joi.string()
      .min(3)
      .required()
      .messages({ "any.required": "Reason is required for rejection" }),
    otherwise: Joi.string().allow(null, ""),
  }),
});

export const barberRescheduleSchema = Joi.object({
  newStartTime: Joi.string().pattern(timePattern).required(),
  newEndTime: Joi.string().pattern(timePattern).required(),
});

export const respondRescheduleSchema = Joi.object({
  action: Joi.string().valid("ACCEPT", "REJECT").required(),
});