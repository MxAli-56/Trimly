import mongoose from "mongoose";
import * as branchRepository from "../../repository/branchRepository.js";

export const getSalons = async (query = {}) => {
  const filters = {};

  if (query.city) {
    filters.city = query.city.trim();
  }

  if (query.area) {
    filters.area = query.area.trim();
  }

  if (query.isOpen !== undefined) {
    filters.isOpen = query.isOpen === "true";
  }

  const salons =
    await branchRepository.findAllActiveBranches(filters);

  return salons;
};

export const searchSalons = async (searchText) => {
  if (!searchText || !searchText.trim()) {
    const error = new Error("Search text is required");
    error.statusCode = 400;
    throw error;
  }

  const salons = await branchRepository.searchBranches(
    searchText.trim(),
  );

  return salons;
};

export const filterSalonsByArea = async (area) => {
  if (!area || !area.trim()) {
    const error = new Error("Area is required");
    error.statusCode = 400;
    throw error;
  }

  const salons =
    await branchRepository.findBranchesByArea(area.trim());

  return salons;
};

export const getSalonById = async (branchId) => {
  if (!branchId) {
    const error = new Error("Salon ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    const error = new Error("Invalid salon ID");
    error.statusCode = 400;
    throw error;
  }

  const salon =
    await branchRepository.findBranchById(branchId);

  if (!salon) {
    const error = new Error("Salon not found");
    error.statusCode = 404;
    throw error;
  }

  return salon;
};