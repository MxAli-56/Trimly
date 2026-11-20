import Joi from "joi";

export const addBarberSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{11,13}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Please enter a valid phone number (11-13 digits).",
      "any.required": "Phone number is required",
    }),
});

export const removeBarberSchema = Joi.object({
  reason: Joi.string().min(3).required().messages({
    "any.required": "Removal reason is required",
    "string.min": "Reason must be at least 3 characters long",
  }),
});