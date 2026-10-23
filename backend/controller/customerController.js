import {
  getCustomerProfile,
  updateCustomerProfile,
} from "../services/customer/profileService.js";

import {
  getSalons,
  searchSalons as searchSalonsService,
  getSalonById,
} from "../services/customer/salonService.js";

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
  getBarberReviews as getBarberReviewsService,
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

import { uploadProfilePhoto as uploadProfilePhotoService } from "../services/customer/profilePhotoService.js";

// Get authenticated user ID.
const getAuthUserId = (req) => req.user?.id ?? req.user?._id ?? req.userId;

const unauthorized = (res) =>
  res.status(401).json({
    success: false,
    message: "Authentication required",
  });

// Central error handler.
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

// Reusable service handler.
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

// ==================== CUSTOMER PROFILE ====================

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

// ==================== PROFILE PHOTO ====================

export const uploadMyProfilePhoto = async (req, res) => {
  const userId = getAuthUserId(req);

  if (!userId) return unauthorized(res);

  try {
    const data = await uploadProfilePhotoService(userId, req.file);

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      data,
    });
  } catch (error) {
    return handleError(res, error, "uploadMyProfilePhoto");
  }
};

// ==================== SALON DISCOVERY ====================

export const getAllSalons = (req, res) =>
  run(res, "getAllSalons", () => getSalons(req.query));

export const searchSalons = (req, res) =>
  run(res, "searchSalons", () => searchSalonsService(req.query.q));

export const getSalonDetails = (req, res) =>
  run(res, "getSalonDetails", () => getSalonById(req.params.branchId));

// ==================== SERVICES ====================

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

// ==================== BARBERS ====================

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

// ==================== FAVORITES ====================

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

// ==================== REVIEWS ====================

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
    getBarberReviewsService(req.params.barberId, req.query),
  );

// ==================== LOYALTY ====================

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

// ==================== CHAT ====================

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

// ==================== AI RECOMMENDATIONS ====================

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
