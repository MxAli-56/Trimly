import express from "express";

import {
  createCustomerBooking,
  getCustomerBookings,
  getCustomerBookingById,
  cancelCustomerBooking,
  rescheduleCustomerBooking,
} from "../controller/bookingController.js";

import authenticate from "../middleware/Auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createCustomerBooking);
router.get("/", getCustomerBookings);
router.get("/:bookingId", getCustomerBookingById);
router.patch("/:bookingId/cancel", cancelCustomerBooking);
router.patch("/:bookingId/reschedule", rescheduleCustomerBooking);

export default router;
