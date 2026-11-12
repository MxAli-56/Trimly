
import mongoose from "mongoose";

import {
  findSalonById,
  findFavouriteSalon,
  createFavouriteSalon,
  deleteFavouriteSalon,
  findFavouriteSalonsByCustomer,
} from "../../repository/favouriteRepository.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const addFavouriteSalon = async (customerId, salonId) => {
  if (!mongoose.isValidObjectId(customerId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(salonId)) {
    throw createError("Invalid salon ID");
  }

  const salon = await findSalonById(salonId);

  if (!salon) {
    throw createError("Salon not found", 404);
  }

  const existing = await findFavouriteSalon(customerId, salonId);

  if (existing) {
    throw createError("Salon already added to favourites", 409);
  }

  try {
    const favourite = await createFavouriteSalon(customerId, salonId);

    return {
      favouriteId: favourite._id,
      salonId: salon._id,
      salonName: salon.name,
      message: "Salon added to favourites successfully",
    };
  } catch (error) {
    if (error.code === 11000) {
      throw createError("Salon already added to favourites", 409);
    }

    throw error;
  }
};

export const removeFavouriteSalon = async (customerId, salonId) => {
  if (!mongoose.isValidObjectId(customerId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(salonId)) {
    throw createError("Invalid salon ID");
  }

  const favourite = await deleteFavouriteSalon(customerId, salonId);

  if (!favourite) {
    throw createError("Salon not found in favourites", 404);
  }

  return {
    salonId,
    message: "Salon removed from favourites successfully",
  };
};

export const getFavouriteSalons = async (customerId) => {
  if (!mongoose.isValidObjectId(customerId)) {
    throw createError("Invalid customer ID", 401);
  }

  const favourites = await findFavouriteSalonsByCustomer(customerId);

  const salons = favourites
    .filter((favourite) => favourite.salonId !== null)
    .map((favourite) => ({
      favouriteId: favourite._id,
      salonId: favourite.salonId._id,
      name: favourite.salonId.name,
      address: favourite.salonId.address,
      area: favourite.salonId.area,
      city: favourite.salonId.city,
      location: favourite.salonId.location,
      isOpen: favourite.salonId.isOpen,
      avgRating: favourite.salonId.avgRating,
      ratingCount: favourite.salonId.ratingCount,
      addedAt: favourite.createdAt,
    }));

  return {
    total: salons.length,
    salons,
  };
};