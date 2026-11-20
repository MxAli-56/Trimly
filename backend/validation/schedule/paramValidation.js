import Joi from "joi";

export const barberProfileIdParamSchema = Joi.object({
  barberProfileId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    "string.pattern.base": "Invalid Barber Profile ID format",
    "any.required": "Barber Profile ID is required"
  }),
});