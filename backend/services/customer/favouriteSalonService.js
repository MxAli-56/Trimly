
import mongoose from "mongoose";

import {
  findSalonById,
  findFavouriteSalon,
  createFavouriteSalon,
} from "../../repository/favouriteRepository.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const addFavouriteSalon = async (
  customerId,
  salonId
) => {
  // Validate IDs
  if (!mongoose.isValidObjectId(customerId)) {
    throw createError("Invalid customer ID", 401);
  }

  if (!mongoose.isValidObjectId(salonId)) {
    throw createError("Invalid salon ID");
  }

  // Check salon exists
  const salon = await findSalonById(salonId);

  if (!salon) {
    throw createError("Salon not found", 404);
  }

  // Check already favourite
  const existing = await findFavouriteSalon(
    customerId,
    salonId
  );

  if (existing) {
    throw createError(
      "Salon already added to favourites",
      409
    );
  }

  // Save favourite
  try {
    const favourite = await createFavouriteSalon(
      customerId,
      salonId
    );

    return {
      favouriteId: favourite._id,
      salonId: salon._id,
      salonName: salon.name,
      message: "Salon added to favourites successfully",
    };
  } catch (error) {
    if (error.code === 11000) {
      throw createError(
        "Salon already added to favourites",
        409
      );
    }

    throw error;
  }
};
