import BarberSchedule from "../model/barberScheduleModel.js";

export const findScheduleByProfileId = async (barberProfileId) => {
  return await BarberSchedule.find({ barberProfileId, deletedAt: null });
};

export const updateSchedule = async (
  barberProfileId,
  dayOfWeek,
  updateData,
) => {
  return await BarberSchedule.findOneAndUpdate(
    { barberProfileId, dayOfWeek },
    { $set: updateData },
    { new: true, upsert: true },
  );
};

export const findBarberSchedule = async (barberProfileId) => {
  return await BarberSchedule.findOne({ barberProfileId }).lean();
};

export const findBarberSchedules = async (barberProfileId) => {
  return await BarberSchedule.find({ barberProfileId })
    .sort({ dayOfWeek: 1 })
    .lean();
};

export const findScheduleByDay = async (barberProfileId, dayOfWeek) => {
  return await BarberSchedule.findOne({
    barberProfileId,
    dayOfWeek,
    deletedAt: null,
  }).lean();
};