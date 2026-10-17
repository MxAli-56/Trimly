import {
  getCustomerProfile,
  updateCustomerProfile,
} from "../services/customer/profileService.js";

import { getSalons, getSalonById } from "../services/customer/salonService.js";

import {
  getBranchCategories,
  getBranchServices,
  getServiceById,
} from "../services/customer/serviceService.js";

import {
  getBranchBarbers,
  getBarberById,
  getBarberSchedule,
} from "../services/customer/barberService.js";

import { getBarberAvailability } from "../services/customer/availabilityService.js";

import {
  getFavorites,
  addFavoriteBranch,
  removeFavoriteBranch,
  addFavoriteBarber,
  removeFavoriteBarber,
} from "../services/customer/favoriteService.js";

import {
  createReview,
  getMyReviews,
  getBranchReviews,
  getBarberReviews,
} from "../services/customer/reviewService.js";

import {
  getLoyaltySummary,
  getLoyaltyHistory,
} from "../services/customer/loyaltyService.js";

import {
  getMyConversations,
  startConversation,
  getConversationMessages,
  sendMessage,
  markConversationRead,
} from "../services/customer/chatService.js";

import {
  createHairstyleRecommendation,
  getMyHairstyleRequests,
  getRecommendedSalons,
} from "../services/customer/recommendationService.js";

// Auth middleware se user ID ka actual format verify karna.
const getAuthUserId = (req) => req.user?.id ?? req.user?._id ?? req.userId;

const unauthorized = (res) =>
  res.status(401).json({
    success: false,
    message: "Authentication required",
  });

const handleError = (res, error, feature) => {
  if (error.message === "NOT_IMPLEMENTED") {
    return res.status(501).json({
      success: false,
      message: "This feature is not implemented yet",
      feature,
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(`Customer controller error (${feature}):`, error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// Reusable handler for service calls.
const run = async (res, feature, serviceCall, statusCode = 200) => {
  try {
    const data = await serviceCall();

    return res.status(statusCode).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error, feature);
  }
};

// Customer profile
export const getMyProfile = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getMyProfile", () => getCustomerProfile(userId));
};

export const updateMyProfile = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "updateMyProfile", () =>
    updateCustomerProfile(userId, req.body),
  );
};

// Salon discovery
export const getAllSalons = (req, res) =>
  run(res, "getAllSalons", () => getSalons(req.query));

export const getSalonDetails = (req, res) =>
  run(res, "getSalonDetails", () => getSalonById(req.params.branchId));

// Services
export const getSalonCategories = (req, res) =>
  run(res, "getSalonCategories", () =>
    getBranchCategories(req.params.branchId),
  );

export const getSalonServices = (req, res) =>
  run(res, "getSalonServices", () =>
    getBranchServices(req.params.branchId, req.query),
  );

export const getServiceDetails = (req, res) =>
  run(res, "getServiceDetails", () =>
    getServiceById(req.params.branchId, req.params.serviceId),
  );

// Barbers
export const getSalonBarbers = (req, res) =>
  run(res, "getSalonBarbers", () =>
    getBranchBarbers(req.params.branchId, req.query),
  );

export const getBarberDetails = (req, res) =>
  run(res, "getBarberDetails", () => getBarberById(req.params.barberId));

export const getBarberScheduleDetails = (req, res) =>
  run(res, "getBarberScheduleDetails", () =>
    getBarberSchedule(req.params.barberId, req.query),
  );

export const getBarberAvailableSlots = (req, res) =>
  run(res, "getBarberAvailableSlots", () =>
    getBarberAvailability(req.params.barberId, req.query),
  );

// Favorites
export const getMyFavorites = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getMyFavorites", () => getFavorites(userId));
};

export const addBranchToFavorites = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(
    res,
    "addBranchToFavorites",
    () => addFavoriteBranch(userId, req.params.branchId),
    201,
  );
};

export const removeBranchFromFavorites = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "removeBranchFromFavorites", () =>
    removeFavoriteBranch(userId, req.params.branchId),
  );
};

export const addBarberToFavorites = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(
    res,
    "addBarberToFavorites",
    () => addFavoriteBarber(userId, req.params.barberId),
    201,
  );
};

export const removeBarberFromFavorites = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "removeBarberFromFavorites", () =>
    removeFavoriteBarber(userId, req.params.barberId),
  );
};

// Reviews
export const createCustomerReview = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(
    res,
    "createCustomerReview",
    () => createReview(userId, req.body),
    201,
  );
};

export const getCustomerReviews = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerReviews", () => getMyReviews(userId, req.query));
};

export const getSalonReviews = (req, res) =>
  run(res, "getSalonReviews", () =>
    getBranchReviews(req.params.branchId, req.query),
  );

export const getBarberReviews = (req, res) =>
  run(res, "getBarberReviews", () =>
    getBarberReviews(req.params.barberId, req.query),
  );

// Loyalty
export const getMyLoyaltySummary = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getMyLoyaltySummary", () => getLoyaltySummary(userId));
};

export const getMyLoyaltyHistory = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getMyLoyaltyHistory", () =>
    getLoyaltyHistory(userId, req.query),
  );
};

// Chat
export const getCustomerConversations = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerConversations", () =>
    getMyConversations(userId, req.query),
  );
};

export const createConversation = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(
    res,
    "createConversation",
    () => startConversation(userId, req.body),
    201,
  );
};

export const getConversationMessagesForCustomer = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getConversationMessagesForCustomer", () =>
    getConversationMessages(userId, req.params.conversationId, req.query),
  );
};

export const sendCustomerMessage = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(
    res,
    "sendCustomerMessage",
    () => sendMessage(userId, req.params.conversationId, req.body),
    201,
  );
};

export const markCustomerConversationRead = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "markCustomerConversationRead", () =>
    markConversationRead(userId, req.params.conversationId),
  );
};

// AI hairstyle recommendations
export const requestHairstyleRecommendation = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(
    res,
    "requestHairstyleRecommendation",
    () => createHairstyleRecommendation(userId, req.body),
    201,
  );
};

export const getMyHairstyleRecommendations = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getMyHairstyleRecommendations", () =>
    getMyHairstyleRequests(userId, req.query),
  );
};

export const getRecommendedSalonList = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getRecommendedSalonList", () =>
    getRecommendedSalons(userId, req.query),
  );
};
