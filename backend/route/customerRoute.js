import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  getAllSalons,
  searchSalons,
  filterSalonsByArea,
  getSalonDetails,
  getSalonCategories,
  getSalonServices,
  getServiceDetails,
  getSalonBarbers,
  getBarberDetails,
  getBarberScheduleDetails,
  getBarberAvailableSlots,
  getMyFavorites,
  addBranchToFavorites,
  removeBranchFromFavorites,
  addBarberToFavorites,
  removeBarberFromFavorites,
  createCustomerReview,
  getCustomerReviews,
  getSalonReviews,
  getBarberReviews,
  getMyLoyaltySummary,
  getMyLoyaltyHistory,
  getCustomerConversations,
  createConversation,
  getConversationMessagesForCustomer,
  sendCustomerMessage,
  markCustomerConversationRead,
  requestHairstyleRecommendation,
  getMyHairstyleRecommendations,
  getRecommendedSalonList,
  uploadMyProfilePhoto,
  getSalonOpeningHours,
  deleteMyProfilePhoto,
  getAllServices,
  searchServices,
  getServicesByCategory,
  getServicePrice,
} from "../controller/customerController.js";

import uploadProfilePhoto from "../middleware/uploadProfilePhoto.js";
import authenticate from "../middleware/Auth.js";

const router = express.Router();

// ========================================
// CUSTOMER PROFILE
// ========================================

router.get("/me", authenticate, getMyProfile);

router.patch("/me", authenticate, updateMyProfile);

router.get("/me/profile", authenticate, getMyProfile);

router.patch("/me/profile", authenticate, updateMyProfile);

// ========================================
// PROFILE PHOTO - API #12
// ========================================

router.patch(
  "/me/profile/photo",
  authenticate,
  uploadProfilePhoto,
  uploadMyProfilePhoto,
);

// Keep old endpoint for compatibility
router.patch(
  "/me/profile-photo",
  authenticate,
  uploadProfilePhoto,
  uploadMyProfilePhoto,
);

router.delete("/me/profile/photo", authenticate, deleteMyProfilePhoto);
// ========================================
// SALON DISCOVERY
// ========================================

router.get("/salons", authenticate, getAllSalons);

router.get("/salons/search", authenticate, searchSalons);

router.get("/salons/filter/area", authenticate, filterSalonsByArea);

router.get("/salons/:branchId/categories", getSalonCategories);

router.get("/salons/:branchId/services", authenticate, getSalonServices);

router.get(
  "/salons/:branchId/services/:serviceId",
  authenticate,
  getServiceDetails,
);
router.get(
  "/salons/:branchId/opening-hours",
  authenticate,
  getSalonOpeningHours,
);

router.get("/salons/:branchId/barbers", authenticate, getSalonBarbers);

router.get("/salons/:branchId/reviews", getSalonReviews);

router.get("/salons/:branchId", authenticate, getSalonDetails);

// ========================================
// BARBER MANAGEMENT
// ========================================

router.get("/barbers/:barberId/schedule", getBarberScheduleDetails);

router.get("/barbers/:barberId/availability", getBarberAvailableSlots);

router.get("/barbers/:barberId/reviews", authenticate, getBarberReviews);

router.get("/barbers/:barberId", authenticate, getBarberDetails);

// ========================================
// FAVORITES
// ========================================

router.get("/me/favorites", authenticate, getMyFavorites);

router.post(
  "/me/favorites/branches/:branchId",
  authenticate,
  addBranchToFavorites,
);

router.delete(
  "/me/favorites/branches/:branchId",
  authenticate,
  removeBranchFromFavorites,
);

router.post(
  "/me/favorites/barbers/:barberId",
  authenticate,
  addBarberToFavorites,
);

router.delete(
  "/me/favorites/barbers/:barberId",
  authenticate,
  removeBarberFromFavorites,
);

// ========================================
// RATINGS & REVIEWS
// ========================================

router.post("/me/reviews", authenticate, createCustomerReview);

router.get("/me/reviews", authenticate, getCustomerReviews);

// ========================================
// LOYALTY POINTS
// ========================================

router.get("/me/loyalty", authenticate, getMyLoyaltySummary);

router.get("/me/loyalty/history", authenticate, getMyLoyaltyHistory);

// ========================================
// CUSTOMER CHAT
// ========================================

router.get("/me/conversations", authenticate, getCustomerConversations);

router.post("/me/conversations", authenticate, createConversation);

router.get(
  "/me/conversations/:conversationId/messages",
  authenticate,
  getConversationMessagesForCustomer,
);

router.post(
  "/me/conversations/:conversationId/messages",
  authenticate,
  sendCustomerMessage,
);

router.patch(
  "/me/conversations/:conversationId/read",
  authenticate,
  markCustomerConversationRead,
);

// ========================================
// Service
// ========================================

router.get("/services", authenticate, getAllServices);
router.get("/services/search", authenticate, searchServices);
router.get(
  "/services/category/:categoryId",
  authenticate,
  getServicesByCategory,
);
router.get(
  "/services/:serviceId/price",
  authenticate,
  getServicePrice
);
// ========================================
// AI RECOMMENDATIONS
// ========================================

router.post(
  "/me/hairstyle-recommendations",
  authenticate,
  requestHairstyleRecommendation,
);

router.get(
  "/me/hairstyle-recommendations",
  authenticate,
  getMyHairstyleRecommendations,
);

router.get("/me/recommended-salons", authenticate, getRecommendedSalonList);

export default router;
