import Service from "../model/serviceModel.js";
import Category from "../model/categoryModel.js";

export const findServicesByBranchId = async (branchId) => {
  return await Service.find({
    branchId,
    isActive: true,
    deletedAt: null,
  })
    .select(
      "branchId categoryId name description price durationMinutes isActive createdAt updatedAt",
    )
    .populate("categoryId", "name description")
    .sort({ name: 1 });
};

// getServiceById()
export const findServiceById = async (branchId, serviceId) => {
  return await Service.findOne({
    _id: serviceId,
    branchId,
    isActive: true,
    deletedAt: null,
  })
    .select(
      "branchId categoryId name description price durationMinutes isActive createdAt updatedAt",
    )
    .populate("categoryId", "name description");
};

export const findAllActiveServices = async ({ skip = 0, limit = 10 } = {}) => {
  return await Service.find({
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countAllActiveServices = async () => {
  return await Service.countDocuments({
    deletedAt: null,
  });
};
