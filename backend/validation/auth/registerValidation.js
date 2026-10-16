import Joi from "joi";
import { ALL_ROLES } from "../../config/role.js";

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
    .pattern(/^\+?[0-9]{11,13}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be between 11 and 13 digits",
      "any.required": "Phone number is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  roles: Joi.array()
    .items(Joi.string().valid(...ALL_ROLES))
    .optional(),
});