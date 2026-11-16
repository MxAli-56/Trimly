import express from "express";
import { SubmitReview, GetMyReviews } from "../controller/reviewController.js";
import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { validateBody, validateQuery } from "../middleware/validateBody.js";
import { ROLES } from "../config/role.js";
import { createReviewSchema } from "../validation/review/reviewValidation.js";
import { paginationQuerySchema } from "../validation/barber/queryValidation.js"; // Reusing pagination

const router = express.Router();

router.use(authenticate);

// Customer submits a review
router.post(
  "/",
  requiredRoles(ROLES.CUSTOMER),
  validateBody(createReviewSchema),
  SubmitReview,
);

// Barber views their reviews
router.get(
  "/barber",
  requiredRoles(ROLES.BARBER),
  validateQuery(paginationQuerySchema),
  GetMyReviews,
);

export default router;