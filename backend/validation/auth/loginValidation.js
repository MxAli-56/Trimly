import Joi from "joi";

export const loginSchema = Joi.object({
  identifier: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
  deviceFcmToken: Joi.string().optional().allow(null, ""),
}).or("identifier", "email", "phone");