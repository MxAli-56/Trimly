import express from "express";
import {
  createCustomerBooking,
  getCustomerBookings,
  getCustomerBookingById,
  cancelCustomerBooking,
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
  createOffPeakBookingHandler,
  respondToOffPeakBookingHandler,
  barberRequestReschedule,
  customerRespondReschedule,
} from "../controller/bookingController.js";

import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { validateBody } from "../middleware/validateBody.js";
import { ROLES } from "../config/role.js";

import { createBookingSchema, offPeakBookingSchema } from "../validation/booking/createBookingValidation.js";
import { rejectBookingSchema, offPeakActionSchema, barberRescheduleSchema, respondRescheduleSchema } from "../validation/booking/bookingActionValidation.js";

const router = express.Router();

router.use(authenticate);

// ==========================================
// CUSTOMER ROUTES
// ==========================================

router.post("/", requiredRoles(ROLES.CUSTOMER), validateBody(createBookingSchema), createCustomerBooking);
router.post("/off-peak", requiredRoles(ROLES.CUSTOMER), validateBody(offPeakBookingSchema), createOffPeakBookingHandler);

router.get("/", requiredRoles(ROLES.CUSTOMER), getCustomerBookings);
router.get("/upcoming", requiredRoles(ROLES.CUSTOMER), getCustomerUpcomingBookings);
router.get("/past", requiredRoles(ROLES.CUSTOMER), getCustomerPastBookings);

router.get("/:bookingId", requiredRoles(ROLES.CUSTOMER), getCustomerBookingById);
router.get("/:bookingId/status", requiredRoles(ROLES.CUSTOMER), getCustomerBookingStatus);
router.get("/:bookingId/appointment-code", requiredRoles(ROLES.CUSTOMER), getCustomerAppointmentCode);

router.patch("/:bookingId/cancel", requiredRoles(ROLES.CUSTOMER), cancelCustomerBooking);
router.patch("/:bookingId/pay", requiredRoles(ROLES.CUSTOMER), payBookingDeposit);
router.patch("/:bookingId/respond-reschedule", requiredRoles(ROLES.CUSTOMER), validateBody(respondRescheduleSchema), customerRespondReschedule);

// Refund/Cancellation routes

router.get("/:bookingId/cancellation-eligibility", requiredRoles(ROLES.CUSTOMER), getCancellationEligibility);
router.get("/:bookingId/calculate-refund", requiredRoles(ROLES.CUSTOMER), getCalculatedRefund);
router.get("/:bookingId/cancellation-details", requiredRoles(ROLES.CUSTOMER), getCustomerCancellationDetails);
router.get("/:bookingId/refund-status", requiredRoles(ROLES.CUSTOMER), getCustomerRefundStatus);

// ==========================================
// BARBER ROUTES
// ==========================================

router.patch("/:bookingId/accept", requiredRoles(ROLES.BARBER), acceptBarberBooking);
router.patch("/:bookingId/reject", requiredRoles(ROLES.BARBER), validateBody(rejectBookingSchema), rejectBarberBooking);
router.patch("/:bookingId/off-peak-respond", requiredRoles(ROLES.BARBER), validateBody(offPeakActionSchema), respondToOffPeakBookingHandler);
router.patch("/:bookingId/barber-reschedule", requiredRoles(ROLES.BARBER), validateBody(barberRescheduleSchema), barberRequestReschedule);

export default router;