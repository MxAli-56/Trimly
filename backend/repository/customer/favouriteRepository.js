
import Favourite from "../../model/favouriteModel.js";
import Branch from "../../model/branchModel.js";
import BarberProfile from "../../model/barberProfileModel.js";

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

export const deleteFavouriteSalon = async (customerId, salonId) => {
  return Favourite.findOneAndDelete({
    customerId,
    salonId,
  });
};

export const findFavouriteSalonsByCustomer = async (customerId) => {
  return Favourite.find({ customerId })
    .populate({
      path: "salonId",
      select: "name address area city location isOpen avgRating ratingCount",
      match: { deletedAt: null },
    })
    .sort({ createdAt: -1 })
    .lean();
};



export const findBarberProfileById = async (barberId) => {
  return BarberProfile.findOne({
    _id: barberId,
    deletedAt: null,
  }).lean();
};

export const findFavouriteBarber = async (customerId, barberId) => {
  return Favourite.findOne({
    customerId,
    barberId,
  }).lean();
};

export const createFavouriteBarber = async (customerId, barberId) => {
  return Favourite.create({
    customerId,
    barberId,
  });
};


export const deleteFavouriteBarber = async (customerId, barberId) => {
  return Favourite.findOneAndDelete({
    customerId,
    barberId,
  });
};