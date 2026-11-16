import Joi from "joi";

export const updateProfileSchema = Joi.object({
  bio: Joi.string().trim().max(500).allow("").optional(),
  specialties: Joi.array().items(Joi.string().trim()).optional(),
});