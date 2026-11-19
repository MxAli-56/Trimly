
import mongoose from "mongoose";
import Favorite from "../model/favoriteModel.js";
import Branch from "../model/branchModel.js";
import BarberProfile from "../model/barberProfileModel.js";

export const findBarberById = async (barberId) => {
  return BarberProfile.findOne({
    _id: barberId,
    deletedAt: null,
  }).lean();
};

export const findSalonById = async (branchId) => {
  return Branch.findOne({
    _id: branchId,
    deletedAt: null,
  }).lean();
};

export const findFavoritesByType = async (
  customerId,
  itemType
) => {
  return Favorite.find({
    customerId,
    itemType,
  })
    .sort({ createdAt: -1 })
    .lean();
};

export const findAllFavorites = async (customerId) => {
  return Favorite.find({ customerId })
    .sort({ createdAt: -1 })
    .lean();
};

export const addFavorite = async (
  customerId,
  itemId,
  itemType
) => {
  return Favorite.findOneAndUpdate(
    { customerId, itemId, itemType },
    {
      $setOnInsert: {
        customerId,
        itemId,
        itemType,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    }
  ).lean();
};

export const removeFavorite = async (
  customerId,
  itemId,
  itemType
) => {
  return Favorite.findOneAndDelete({
    customerId,
    itemId,
    itemType,
  }).lean();
};


export const getBarberDetails = async (ids) => {
  if (ids.length === 0) return [];

  return BarberProfile.find({
    _id: { $in: ids },
    deletedAt: null,
  })
    .populate("userId", "name email profilePhoto")
    .lean();
};


export const getSalonDetails = async (ids) => {
  if (ids.length === 0) return [];

  return Branch.find({
    _id: { $in: ids },
    deletedAt: null,
  }).lean();
};
