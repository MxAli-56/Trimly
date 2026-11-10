
import Favourite from "../model/favouriteModel.js";
import Branch from "../model/branchModel.js";

export const findSalonById = async (salonId) => {
  return Branch.findOne({
    _id: salonId,
    deletedAt: null,
  }).lean();
};

export const findFavouriteSalon = async (
  customerId,
  salonId
) => {
  return Favourite.findOne({
    customerId,
    salonId,
  }).lean();
};

export const createFavouriteSalon = async (
  customerId,
  salonId
) => {
  return Favourite.create({
    customerId,
    salonId,
  });
};
