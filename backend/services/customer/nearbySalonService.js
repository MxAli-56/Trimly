
import {
  findNearbyBranches,
} from "../../repository/branchRepository.js";

const createError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

export const getNearbySalons = async (query = {}) => {
  const {
    latitude,
    longitude,
    radius = 5,
  } = query;

  if (
    latitude === undefined ||
    longitude === undefined ||
    String(latitude).trim() === "" ||
    String(longitude).trim() === ""
  ) {
    throw createError(
      "Latitude and longitude are required"
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const radiusKm = Number(radius);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw createError("Invalid latitude or longitude");
  }

  if (
    !Number.isFinite(radiusKm) ||
    radiusKm <= 0 ||
    radiusKm > 50
  ) {
    throw createError(
      "Radius must be between 0 and 50 km"
    );
  }

  const salons = await findNearbyBranches({
    latitude: lat,
    longitude: lng,
    radiusMeters: radiusKm * 1000,
  });

  return salons;
};
