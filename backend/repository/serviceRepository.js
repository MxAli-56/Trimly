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

export const countSearchActiveServices = async (searchText) => {
  const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return await Service.countDocuments({
    deletedAt: null,
    name: {
      $regex: escapedSearch,
      $options: "i",
    },
  });
};

export const searchActiveServices = async ({
  searchText,
  skip = 0,
  limit = 10,
}) => {
  const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return await Service.find({
    deletedAt: null,
    name: {
      $regex: escapedSearch,
      $options: "i",
    },
  })
    .sort({ name: 1, _id: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
};
