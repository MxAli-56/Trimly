import mongoose from "mongoose";

import {
  findBarberProfileById,
  findFavouriteBarber,
  createFavouriteBarber,
  deleteFavouriteBarber,
  findFavouriteBarbersByCustomer,
} from "../../repository/customer/favouriteRepository.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const addFavouriteBarber = async (customerId, barberId) => {
  if (!mongoose.isValidObjectId(customerId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(barberId)) {
    throw createError("Invalid barber ID", 400);
  }

  const barber = await findBarberProfileById(barberId);

  if (!barber) {
    throw createError("Barber not found", 404);
  }

  const existing = await findFavouriteBarber(customerId, barberId);

  if (existing) {
    throw createError("Barber already added to favourites", 409);
  }

  try {
    const favourite = await createFavouriteBarber(customerId, barberId);

    return {
      favouriteId: favourite._id,
      barberId: barber._id,
      message: "Barber added to favourites successfully",
    };
  } catch (error) {
    if (error.code === 11000) {
      throw createError("Barber already added to favourites", 409);
    }

    throw error;
  }
};


export const removeFavouriteBarber = async (customerId, barberId) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw createError("Invalid customer ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    throw createError("Invalid barber ID", 400);
  }

  const deletedFavourite = await deleteFavouriteBarber(
    customerId,
    barberId
  );

  if (!deletedFavourite) {
    throw createError("Barber not found in favourites", 404);
  }

  return {
    barberId: deletedFavourite.barberId,
    message: "Barber removed from favourites successfully",
  };
};


export const getFavouriteBarbers = async (customerId) => {
  if (!mongoose.isValidObjectId(customerId)) {
    throw createError("Invalid customer ID", 400);
  }

  const favourites = await findFavouriteBarbersByCustomer(customerId);

  const barbers = favourites
    .filter((item) => item.barberId && item.barberId.userId)
    .map((item) => ({
      favouriteId: item._id,
      barberId: item.barberId._id,
      name: item.barberId.userId.name,
      profilePhoto: item.barberId.userId.profilePhoto,
      bio: item.barberId.bio,
      specialties: item.barberId.specialties,
      isAvailable: item.barberId.isAvailable,
      avgRating: item.barberId.avgRating,
      ratingCount: item.barberId.ratingCount,
      salon: item.barberId.branchId,
      addedAt: item.createdAt,
    }));

  return {
    total: barbers.length,
    barbers,
  };
};