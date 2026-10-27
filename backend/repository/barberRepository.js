import BarberProfile from "../model/barberProfileModel.js";
import User from "../model/userModel.js";

export const findBarbersByBranchId = async (branchId) => {
  return await BarberProfile.find({
    branchId,
    isAvailable: true,
    deletedAt: null,
  })
    .select(
      "userId branchId bio specialties isAvailable avgRating ratingCount createdAt updatedAt"
    )
    .populate("userId", "name email phone profilePhoto")
    .sort({
      avgRating: -1,
      createdAt: -1,
    });
};