import BarberProfile from "../model/barberProfileModel.js";

export const findBarbersByBranchId = async (branchId) => {
  return await BarberProfile.find({
    currentBranchId: branchId, 
    isAvailable: true,
    deletedAt: null,
  })
    .select(
      "userId currentBranchId bio specialties isAvailable avgRating ratingCount",
    )
    .populate("userId", "name email phone profilePhoto")
    .sort({ avgRating: -1, createdAt: -1 });
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