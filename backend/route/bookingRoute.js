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
  startBarberBooking,
  completeBarberBooking,
  markBookingNoShow,
} from "../controller/bookingController.js";

import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { validateBody, validateParams } from "../middleware/validateBody.js"; // Updated import
import { ROLES } from "../config/role.js";

import { createBookingSchema, offPeakBookingSchema } from "../validation/booking/createBookingValidation.js";
import { rejectBookingSchema, offPeakActionSchema, barberRescheduleSchema, respondRescheduleSchema } from "../validation/booking/bookingActionValidation.js";
import { bookingIdParamSchema } from "../validation/booking/paramValidation.js"; // Import param validation

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

// validateParams added to all routes with :bookingId
router.get("/:bookingId", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), getCustomerBookingById);
router.get("/:bookingId/status", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), getCustomerBookingStatus);
router.get("/:bookingId/appointment-code", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), getCustomerAppointmentCode);

router.patch("/:bookingId/cancel", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), cancelCustomerBooking);
router.patch("/:bookingId/pay", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), payBookingDeposit);
router.patch("/:bookingId/respond-reschedule", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), validateBody(respondRescheduleSchema), customerRespondReschedule);

// Refund/Cancellation routes
router.get("/:bookingId/cancellation-eligibility", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), getCancellationEligibility);
router.get("/:bookingId/calculate-refund", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), getCalculatedRefund);
router.get("/:bookingId/cancellation-details", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), getCustomerCancellationDetails);
router.get("/:bookingId/refund-status", requiredRoles(ROLES.CUSTOMER), validateParams(bookingIdParamSchema), getCustomerRefundStatus);

// ==========================================
// BARBER ROUTES
// ==========================================

router.patch("/:bookingId/accept", requiredRoles(ROLES.BARBER), validateParams(bookingIdParamSchema), acceptBarberBooking);
router.patch("/:bookingId/reject", requiredRoles(ROLES.BARBER), validateParams(bookingIdParamSchema), validateBody(rejectBookingSchema), rejectBarberBooking);
router.patch("/:bookingId/off-peak-respond", requiredRoles(ROLES.BARBER), validateParams(bookingIdParamSchema), validateBody(offPeakActionSchema), respondToOffPeakBookingHandler);
router.patch("/:bookingId/barber-reschedule", requiredRoles(ROLES.BARBER), validateParams(bookingIdParamSchema), validateBody(barberRescheduleSchema), barberRequestReschedule);
router.patch("/:bookingId/start", requiredRoles(ROLES.BARBER), validateParams(bookingIdParamSchema), startBarberBooking);
router.patch("/:bookingId/complete", requiredRoles(ROLES.BARBER), validateParams(bookingIdParamSchema), completeBarberBooking);
router.patch("/:bookingId/no-show", requiredRoles(ROLES.BARBER), validateParams(bookingIdParamSchema), markBookingNoShow);

export default router;