import Joi from "joi";

export const toggleAvailabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required().messages({
    "any.required": "isAvailable is required",
    "boolean.base": "isAvailable must be true or false",
  }),
});