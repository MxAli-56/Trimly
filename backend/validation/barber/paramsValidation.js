import Joi from "joi";

export const leaveIdParamSchema = Joi.object({
  leaveId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Leave ID format",
    }),
});