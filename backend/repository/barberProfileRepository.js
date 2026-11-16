import BarberProfile from "../model/barberProfileModel.js";
import mongoose from "mongoose";

export const findBarbersByBranchId = async (branchId) => {
  const barbers = await BarberProfile.collection
    .find({
      branchId: new mongoose.Types.ObjectId(branchId),
      deletedAt: null,
    })
    .toArray();

  return barbers;
};

export const findBarberById = async (barberId) => {
  return await BarberProfile.findOne({
    _id: barberId,
    deletedAt: null,
  })
    .select(
      "userId currentBranchId bio specialties isAvailable avgRating ratingCount",
    )
    .populate("userId", "name email phone profilePhoto")
    .populate("currentBranchId", "name address area city isOpen avgRating");
};

export const findActiveBarberProfile = async (barberId) => {
  return await BarberProfile.findOne({ _id: barberId, deletedAt: null }).lean();
};

export const findBarberProfileForAvailability = async (barberId) => {
  return await BarberProfile.findOne({ _id: barberId, deletedAt: null })
    .select("_id userId currentBranchId isAvailable")
    .lean();
};

export const findProfileByUserId = async (userId) => {
  return await BarberProfile.findOne({ userId, deletedAt: null });
};

export const findBarberProfile = async (barberProfileId) => {
  return await BarberProfile.findOne({
    _id: barberProfileId,
    deletedAt: null,
  }).lean();
};

export const updateAvailabilityStatus = async (barberProfileId, isAvailable) => {
  return await BarberProfile.findByIdAndUpdate(
    barberProfileId,
    { $set: { isAvailable } },
    { new: true }
  ).select("_id isAvailable");
};