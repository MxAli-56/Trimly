import BarberProfile from "../model/barberProfileModel.js";
import mongoose from "mongoose";

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
export const acquireBookingWriteLock = async (barberProfileId, session) => {
  return BarberProfile.findOneAndUpdate(
    {
      _id: barberProfileId,
      deletedAt: null,
    },
    {
      $inc: { bookingLockVersion: 1 },
    },
    {
      new: true,
      session,
    },
  ).select("_id");
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

export const updateAvailabilityStatus = async (
  barberProfileId,
  isAvailable,
) => {
  return await BarberProfile.findByIdAndUpdate(
    barberProfileId,
    { $set: { isAvailable } },
    { new: true },
  ).select("_id isAvailable");
};

export const updateBarberProfile = async (barberProfileId, updateData) => {
  return await BarberProfile.findByIdAndUpdate(
    barberProfileId,
    { $set: updateData },
    { returnDocument: "after", runValidators: true },
  ).populate("userId", "name email phone profilePhoto");
};

export const atomicUpdateBarberRating = async (barberProfileId, newRating) => {
  return await BarberProfile.findByIdAndUpdate(
    barberProfileId,
    [
      {
        $set: {
          ratingCount: { $add: [{ $ifNull: ["$ratingCount", 0] }, 1] },
          avgRating: {
            $round: [
              {
                $divide: [
                  {
                    $add: [
                      {
                        $multiply: [
                          { $ifNull: ["$avgRating", 0] },
                          { $ifNull: ["$ratingCount", 0] },
                        ],
                      },
                      newRating,
                    ],
                  },
                  { $add: [{ $ifNull: ["$ratingCount", 0] }, 1] },
                ],
              },
              1,
            ],
          },
        },
      },
    ],
    { returnDocument: "after" },
  );
};

export const findBarberProfileById = async (profileId) => {
  return await BarberProfile.findOne({ _id: profileId, deletedAt: null });
};

export const createBarberProfileRecord = async (profileData) => {
  return await BarberProfile.create(profileData);
};

export const updateBarberBranchAndHistory = async (
  profileId,
  newBranchId,
  historyEntry,
) => {
  return await BarberProfile.findByIdAndUpdate(
    profileId,
    {
      $set: { currentBranchId: newBranchId },
      $push: { employmentHistory: historyEntry },
    },
    { returnDocument: "after" },
  );
};