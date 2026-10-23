import Branch from "../model/branchModel.js";

export const findAllActiveBranches = async (filters = {}) => {
  const query = {
    deletedAt: null,
  };

  if (filters.city) {
    query.city = {
      $regex: filters.city,
      $options: "i",
    };
  }

  if (filters.area) {
    query.area = {
      $regex: filters.area,
      $options: "i",
    };
  }

  if (filters.isOpen !== undefined) {
    query.isOpen = filters.isOpen;
  }

  return await Branch.find(query)
    .select(
      "name address area city isOpen avgRating ratingCount ownerId createdAt updatedAt",
    )
    .sort({
      avgRating: -1,
      createdAt: -1,
    });
};

export const findBranchById = async (branchId) => {
  return await Branch.findOne({
    _id: branchId,
    deletedAt: null,
  }).select(
    "name address area city isOpen avgRating ratingCount ownerId createdAt updatedAt",
  );
};

export const searchBranches = async (searchText) => {
  return await Branch.find({
    deletedAt: null,

    $or: [
      {
        name: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        area: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        city: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        address: {
          $regex: searchText,
          $options: "i",
        },
      },
    ],
  })
    .select(
      "name address area city isOpen avgRating ratingCount ownerId createdAt updatedAt",
    )
    .sort({
      avgRating: -1,
      createdAt: -1,
    });
};