import express from "express";

import {
  createCustomerBooking,
  getCustomerBookings,
  getCustomerBookingById,
  cancelCustomerBooking,
  rescheduleCustomerBooking,
  getCustomerUpcomingBookings,
  getCustomerPastBookings,
  getCustomerBookingStatus,
  getCustomerAppointmentCode,
  getCancellationEligibility,
  getCalculatedRefund,
  getCustomerCancellationDetails,
  getCustomerRefundStatus,
  acceptBarberBooking,
  rejectBarberBooking,
  payBookingDeposit,
} from "../controller/bookingController.js";

import authenticate from "../middleware/Auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createCustomerBooking);

router.get("/", getCustomerBookings);
router.get("/upcoming", getCustomerUpcomingBookings);
router.get("/past", getCustomerPastBookings);

router.get("/:bookingId", getCustomerBookingById);
router.get("/:bookingId/status", getCustomerBookingStatus);
router.get("/:bookingId/appointment-code", getCustomerAppointmentCode);

router.patch("/:bookingId/cancel", cancelCustomerBooking);
router.patch("/:bookingId/reschedule", rescheduleCustomerBooking);

router.get("/:bookingId/cancellation-eligibility", getCancellationEligibility);
router.get("/:bookingId/calculate-refund", getCalculatedRefund);
router.get("/:bookingId/cancellation-details", getCustomerCancellationDetails);
router.get("/:bookingId/refund-status", getCustomerRefundStatus);

router.patch("/:bookingId/accept", acceptBarberBooking);
router.patch("/:bookingId/reject", rejectBarberBooking);
router.patch("/:bookingId/pay", payBookingDeposit);

export default router;
