import express from "express";

import {
  createCustomerBooking,
  getCustomerBookings,
  getCustomerBookingById,
  cancelCustomerBooking,
  rescheduleCustomerBooking,
} from "../controller/bookingController.js";

// IMPORTANT:
// Verify that this named export exists in your Auth.js.
// If your middleware has a different name, use its actual export.
import authenticate from "../middleware/Auth.js";

const router = express.Router();

// All booking routes require authentication.
router.use(authenticate);

router.post("/", createCustomerBooking);
router.get("/", getCustomerBookings);
router.get("/:bookingId", getCustomerBookingById);
router.patch("/:bookingId/cancel", cancelCustomerBooking);
router.patch("/:bookingId/reschedule", rescheduleCustomerBooking);

export default router;
