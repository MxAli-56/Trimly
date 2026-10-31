import Joi from "joi";
import { ROLES } from "../../config/role.js";

const ALLOWED_PUBLIC_ROLES = [ROLES.CUSTOMER, ROLES.BARBER, ROLES.SALON_OWNER];

export const verifyOtpSchema = Joi.object({
  idToken: Joi.string().required().messages({
    "any.required": "Firebase token is required",
  }),
  name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  roles: Joi.array()
    .items(Joi.string().valid(...ALLOWED_PUBLIC_ROLES)) // Admin is NOT in this list
    .optional(),
  cnic: Joi.string()
    .pattern(/^\d{5}-\d{7}-\d$/)
    .when("roles", {
      is: Joi.array().items(Joi.string().valid(ROLES.SALON_OWNER)),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.pattern.base": "CNIC must be in format 42101-1234567-8.",
      "any.required": "CNIC is required for salon owners.",
    }),
});
