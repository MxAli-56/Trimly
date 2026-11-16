import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as barberScheduleRepository from "../../repository/barberScheduleRepository.js";

export const getBarberSchedule = async (userId) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  const schedule = await barberScheduleRepository.findScheduleByProfileId(
    profile._id,
  );
  return schedule;
};

export const setBarberSchedule = async (userId, scheduleData) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  if (
    (scheduleData.breakStart && !scheduleData.breakEnd) ||
    (!scheduleData.breakStart && scheduleData.breakEnd)
  ) {
    throw new Error("INVALID_BREAK_TIME");
  }

  const updatedSchedule = await barberScheduleRepository.updateSchedule(
    profile._id,
    scheduleData.dayOfWeek,
    scheduleData,
  );
  return updatedSchedule;
};