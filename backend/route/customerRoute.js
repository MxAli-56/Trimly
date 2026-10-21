import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  getAllSalons,
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
  getBarberReviews as getBarberReviewsController,
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
} from "../controller/customerController.js";



import {
  uploadMyProfilePhoto,
} from "../controller/customerController.js";

import uploadProfilePhoto from "../middleware/uploadProfilePhoto.js";
// IMPORTANT:
// Apne middleware/Auth.js se actual authentication middleware import karein.
// Neeche "authenticate" assumed export name hai; actual export verify karein.
import authenticate from "../middleware/Auth.js";

const router = express.Router();

// Public discovery
router.get("/salons", getAllSalons);
router.get("/salons/:branchId", getSalonDetails);
router.get("/salons/:branchId/categories", getSalonCategories);
router.get("/salons/:branchId/services", getSalonServices);
router.get("/salons/:branchId/services/:serviceId", getServiceDetails);

router.get("/salons/:branchId/barbers", getSalonBarbers);
router.get("/barbers/:barberId", getBarberDetails);
router.get("/barbers/:barberId/schedule", getBarberScheduleDetails);
router.get("/barbers/:barberId/availability", getBarberAvailableSlots);

router.get("/salons/:branchId/reviews", getSalonReviews);
router.get("/barbers/:barberId/reviews", getBarberReviewsController);

// Authenticated customer routes
router.get("/me", authenticate, getMyProfile);
router.patch("/me", authenticate, updateMyProfile);

router.patch(
  "/me/profile-photo",
  authenticate,
  uploadProfilePhoto.single("profilePhoto"),
  uploadMyProfilePhoto
);  

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

router.post("/me/reviews", authenticate, createCustomerReview);
router.get("/me/reviews", authenticate, getCustomerReviews);

router.get("/me/loyalty", authenticate, getMyLoyaltySummary);
router.get("/me/loyalty/history", authenticate, getMyLoyaltyHistory);

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
