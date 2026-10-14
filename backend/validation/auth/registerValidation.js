import Joi from "joi";

const nameValidation = Joi.string()
  .pattern(/^[a-zA-Z\s'-]+$/)
  .required()
  .messages({
    "string.pattern.base":
      "Name can only contain alphabets, spaces, hyphens, and apostrophes",
    "any.required": "Name is required",
  });

export const registerSchema = Joi.object({
  name: nameValidation,
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^[0-9+\s-]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid phone number",
      "any.required": "Phone number is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  roles: Joi.array()
    .items(Joi.string().valid("CUSTOMER", "BARBER", "SALON_OWNER", "ADMIN"))
    .optional(),
});