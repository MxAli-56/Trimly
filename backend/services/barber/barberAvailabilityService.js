// backend/services/barber/barberAvailabilityService.js
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import * as barberLeaveRepository from "../../repository/barberLeaveRepository.js";

export const toggleAvailability = async (userId, isAvailable) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  if (typeof isAvailable !== "boolean") {
    throw new Error("INVALID_INPUT");
  }

  return await barberProfileRepository.updateAvailabilityStatus(
    profile._id,
    isAvailable,
  );
};

export const addTemporaryLeave = async (userId, leaveData) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  const { leaveDate, startTime, endTime, reason } = leaveData;

  if (startTime >= endTime) {
    throw new Error("INVALID_TIME_RANGE");
  }

  const leavePayload = {
    barberProfileId: profile._id,
    leaveDate: new Date(leaveDate),
    startTime,
    endTime,
    reason,
  };

  return await barberLeaveRepository.createLeave(leavePayload);
};

export const getMyLeaves = async (userId) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  return await barberLeaveRepository.findLeavesByProfileId(profile._id);
};

export const removeLeave = async (userId, leaveId) => {
  const profile = await barberProfileRepository.findProfileByUserId(userId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  const deleted = await barberLeaveRepository.deleteLeaveById(
    leaveId,
    profile._id,
  );
  if (!deleted) throw new Error("LEAVE_NOT_FOUND");

  return deleted;
};