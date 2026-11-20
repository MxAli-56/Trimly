import mongoose from "mongoose";
import User from "../../model/userModel.js";
import Branch from "../../model/branchModel.js";
import BarberProfile from "../../model/barberProfileModel.js";
import * as branchRepository from "../../repository/branchRepository.js";
import * as userRepository from "../../repository/userRepository.js";
import * as barberProfileRepository from "../../repository/barberProfileRepository.js";
import { ROLES } from "../../config/role.js";

export const addBarberToSalon = async (ownerId, phoneNumber) => {
  // 1. Verify Owner's Branch
  const branch = await branchRepository.findBranchByOwnerId(ownerId);
  if (!branch) throw new Error("BRANCH_NOT_FOUND");

  // 2. Find User by Phone
  const user = await userRepository.findByPhone(phoneNumber);
  if (!user) throw new Error("USER_NOT_FOUND");

  // 3. Verify user has BARBER role
  if (!user.roles.includes(ROLES.BARBER)) {
    throw new Error("USER_NOT_BARBER");
  }

  // 4. Check if profile already exists
  const existingProfile = await barberProfileRepository.findProfileByUserId(
    user._id,
  );

  if (existingProfile) {
    if (existingProfile.currentBranchId) {
      throw new Error("ALREADY_IN_SALON"); // Faisla karo ke transfer allow karna hai ya nahi
    }

    // Agar profile hai lekin kisi salon me nahi (solo/unemployed), toh wapis add kardo
    const historyEntry = {
      branchId: branch._id,
      joinedAt: new Date(),
      leftAt: null,
      reason: null,
    };

    return await barberProfileRepository.updateBarberBranchAndHistory(
      existingProfile._id,
      branch._id,
      historyEntry,
    );
  }

  // 5. Create a brand new profile
  const newProfile = await barberProfileRepository.createBarberProfileRecord({
    userId: user._id,
    currentBranchId: branch._id,
    bio: "Professional barber", // Default
    specialties: [],
    isAvailable: false,
    employmentHistory: [
      {
        branchId: branch._id,
        joinedAt: new Date(),
        leftAt: null,
        reason: null,
      },
    ],
  });

  return newProfile;
};

export const removeBarberFromSalon = async (
  ownerId,
  barberProfileId,
  reason,
) => {
  // 1. Verify Owner's Branch
  const branch = await branchRepository.findBranchByOwnerId(ownerId);
  if (!branch) throw new Error("BRANCH_NOT_FOUND");

  // 2. Find Barber Profile
  const barberProfile =
    await barberProfileRepository.findBarberProfileById(barberProfileId);
  if (!barberProfile) throw new Error("PROFILE_NOT_FOUND");

  // 3. Verify barber belongs to this owner's branch
  if (String(barberProfile.currentBranchId) !== String(branch._id)) {
    throw new Error("UNAUTHORIZED");
  }

  // 4. Update Profile: set currentBranchId to null, update history
  // Find the active employment history entry to set its leftAt date
  const historyEntry = barberProfile.employmentHistory.find(
    (h) => String(h.branchId) === String(branch._id) && h.leftAt === null,
  );

  if (historyEntry) {
    historyEntry.leftAt = new Date();
    historyEntry.reason = reason;
  }

  barberProfile.currentBranchId = null;
  await barberProfile.save();

  return barberProfile;
};