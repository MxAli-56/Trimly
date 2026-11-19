
import mongoose from "mongoose";
import * as favoriteRepository from "../../repository/favoriteRepository.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid ID", 400);
  }
};

const getFavoriteDetails = async (userId, type) => {
  validateId(userId);

  const favorites =
    await favoriteRepository.findFavoritesByType(userId, type);

  const ids = favorites.map((favorite) => favorite.itemId);

  const items =
    type === "BARBER"
      ? await favoriteRepository.getBarberDetails(ids)
      : await favoriteRepository.getSalonDetails(ids);

  const itemMap = new Map(
    items.map((item) => [item._id.toString(), item])
  );

  const result = favorites
    .filter((favorite) =>
      itemMap.has(favorite.itemId.toString())
    )
    .map((favorite) => ({
      favoriteId: favorite._id,
      itemType: favorite.itemType,
      addedAt: favorite.createdAt,
      ...(type === "BARBER"
        ? { barber: itemMap.get(favorite.itemId.toString()) }
        : { salon: itemMap.get(favorite.itemId.toString()) }),
    }));

  return {
    total: result.length,
    favorites: result,
  };
};

// API 1: Get Favourite Barbers
export const getFavoriteBarbers = async (userId) => {
  return getFavoriteDetails(userId, "BARBER");
};

// API 2: Add Favourite Barber
export const addFavoriteBarber = async (
  userId,
  barberId
) => {
  validateId(userId);
  validateId(barberId);

  const barber =
    await favoriteRepository.findBarberById(barberId);

  if (!barber) {
    throw createError("Barber not found", 404);
  }

  const favorite = await favoriteRepository.addFavorite(
    userId,
    barberId,
    "BARBER"
  );

  return {
    message: "Barber added to favorites",
    favoriteId: favorite._id,
    barberId,
  };
};

// API 3: Remove Favourite Barber
export const removeFavoriteBarber = async (
  userId,
  barberId
) => {
  validateId(userId);
  validateId(barberId);

  const deleted =
    await favoriteRepository.removeFavorite(
      userId,
      barberId,
      "BARBER"
    );

  if (!deleted) {
    throw createError("Barber is not in favorites", 404);
  }

  return {
    message: "Barber removed from favorites",
    barberId,
  };
};

// API 4: Get Favourite Salons
export const getFavoriteSalons = async (userId) => {
  return getFavoriteDetails(userId, "SALON");
};

// API 5: Add Favourite Salon
export const addFavoriteBranch = async (
  userId,
  branchId
) => {
  validateId(userId);
  validateId(branchId);

  const salon =
    await favoriteRepository.findSalonById(branchId);

  if (!salon) {
    throw createError("Salon not found", 404);
  }

  const favorite = await favoriteRepository.addFavorite(
    userId,
    branchId,
    "SALON"
  );

  return {
    message: "Salon added to favorites",
    favoriteId: favorite._id,
    branchId,
  };
};

// API 6: Remove Favourite Salon
export const removeFavoriteBranch = async (
  userId,
  branchId
) => {
  validateId(userId);
  validateId(branchId);

  const deleted =
    await favoriteRepository.removeFavorite(
      userId,
      branchId,
      "SALON"
    );

  if (!deleted) {
    throw createError("Salon is not in favorites", 404);
  }

  return {
    message: "Salon removed from favorites",
    branchId,
  };
};

// Existing combined favorites API compatibility
export const getFavorites = async (userId) => {
  const [barbers, salons] = await Promise.all([
    getFavoriteBarbers(userId),
    getFavoriteSalons(userId),
  ]);

  return {
    barbers: barbers.favorites,
    salons: salons.favorites,
    total: barbers.total + salons.total,
  };
};
