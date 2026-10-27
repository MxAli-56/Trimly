import BarberProfile from "../model/barberProfileModel.js";
import User from "../model/userModel.js";
import Branch from "../model/branchModel.js";

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

// findBarberById
export const findBarberById = async (barberId) => {
  return await BarberProfile.findOne({
    _id: barberId,
    deletedAt: null,
  })
    .select(
      "userId branchId bio specialties isAvailable avgRating ratingCount createdAt updatedAt"
    )
    .populate("userId", "name email phone profilePhoto")
    .populate(
      "branchId",
      "name address area city isOpen avgRating"
    );
};