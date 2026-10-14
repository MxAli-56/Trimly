import Joi from "joi";

const newPasswordRule = Joi.string().min(6).required().messages({
  "string.min": "Password must be at least 6 characters long",
  "any.required": "New password is required",
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),
  newPassword: newPasswordRule,
});

export const updatePasswordSchema = Joi.object({
  newPassword: newPasswordRule,
});