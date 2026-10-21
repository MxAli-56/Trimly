import Joi from "joi";

const phoneSchema = Joi.string()
  .pattern(/^\+?[0-9]{11,13}$/)
  .required()
  .messages({
    "string.pattern.base": "Please enter a valid phone number (11-13 digits).",
    "string.empty": "Phone number is required.",
    "any.required": "Phone number is required.",
  });

export const sendOtpSchema = Joi.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = Joi.object({
  phone: phoneSchema,
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be exactly 6 digits.",
    "string.empty": "OTP is required.",
    "any.required": "OTP is required.",
  }),
});