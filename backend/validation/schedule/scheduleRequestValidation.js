import Joi from "joi";

const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createScheduleRequestSchema = Joi.object({
  schedule: Joi.array()
    .items(
      Joi.object({
        dayOfWeek: Joi.string()
          .valid(
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY",
          )
          .required(),
        startTime: Joi.string().pattern(timePattern).required(),
        endTime: Joi.string().pattern(timePattern).required(),
        breakStart: Joi.string().pattern(timePattern).allow(null, ""),
        breakEnd: Joi.string().pattern(timePattern).allow(null, ""),
        isWorkingDay: Joi.boolean().required(),
      }),
    )
    .min(1)
    .required(),
});

export const reviewScheduleSchema = Joi.object({
  approvedDays: Joi.array().items(Joi.string()).optional(),
  rejectedDays: Joi.array().items(Joi.string()).optional(),
}).or("approvedDays", "rejectedDays"); // Kam az kam ek array zaroori hai