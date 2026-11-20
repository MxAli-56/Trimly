import mongoose from "mongoose";
import BarberProfile from "../../model/barberProfileModel.js";
import Branch from "../../model/branchModel.js";
import * as barberScheduleRepository from "../../repository/barberScheduleRepository.js";

export const getScheduleByOwner = async (ownerId, barberProfileId) => {
  const barberProfile = await BarberProfile.findById(barberProfileId);
  if (!barberProfile) throw new Error("NOT_FOUND");

  const branch = await Branch.findById(barberProfile.currentBranchId);
  if (!branch || String(branch.ownerId) !== String(ownerId))
    throw new Error("UNAUTHORIZED");

  return await barberScheduleRepository.findScheduleByProfileId(
    barberProfileId,
  );
};

export const setBarberScheduleByOwner = async (
  ownerId,
  barberProfileId,
  scheduleArray,
) => {
  // 1. Verify ownership
  const barberProfile = await BarberProfile.findById(barberProfileId);
  if (!barberProfile) throw new Error("NOT_FOUND");

  const branch = await Branch.findById(barberProfile.currentBranchId);
  if (!branch || String(branch.ownerId) !== String(ownerId)) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Update Schedule
  const updatedDays = [];
  for (const dayData of scheduleArray) {
    if (
      (dayData.breakStart && !dayData.breakEnd) ||
      (!dayData.breakStart && dayData.breakEnd)
    ) {
      throw new Error("INVALID_SCHEDULE");
    }

    const updated = await barberScheduleRepository.updateSchedule(
      barberProfileId,
      dayData.dayOfWeek,
      dayData,
    );
    updatedDays.push(updated);
  }

  return updatedDays;
};
