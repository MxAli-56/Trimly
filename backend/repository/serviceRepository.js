import Service from "../model/serviceModel.js";
import Category from "../model/categoryModel.js";

export const findServicesByBranchId = async (branchId) => {
  return await Service.find({
    branchId,
    isActive: true,
    deletedAt: null,
  })
    .select(
      "branchId categoryId name description price durationMinutes isActive createdAt updatedAt"
    )
    .populate("categoryId", "name description")
    .sort({ name: 1 });
};