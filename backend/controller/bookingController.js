import { createBooking } from "../services/booking/createBookingService.js";
import { getUpcomingBookings } from "../services/booking/upcomingBookingService.js";
import { getPastBookings } from "../services/booking/pastBookingService.js";
import { getBookingStatus } from "../services/booking/bookingStatusService.js";
import { calculateRefund } from "../services/booking/calculateRefundService.js";
import { getCancellationDetails } from "../services/booking/cancellationDetailsService.js";
import { getRefundStatus } from "../services/booking/refundStatusService.js";
import { getAppointmentCode } from "../services/booking/appointmentCodeService.js";
import { checkCancellationEligibility } from "../services/booking/cancellationEligibilityService.js";
import { requestBookingWithTimer } from "../services/booking/requestBookingService.js";
import * as bookingActionService from "../services/booking/bookingActionService.js";
import * as offPeakBookingService from "../services/booking/offPeakBookingService.js";
import {
  getMyBookings,
  getBookingById,
} from "../services/booking/getBookingService.js";

import { cancelBooking } from "../services/booking/cancelBookingService.js";

import { rescheduleBooking } from "../services/booking/rescheduleBookingService.js";

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

  console.error(`Booking controller error (${feature}):`, error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

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

export const createCustomerBooking = async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  try {
    const result = await requestBookingWithTimer(userId, req.body);
    return res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    if (
      error.message === "BARBER_NOT_FOUND" ||
      error.message === "INVALID_SERVICES"
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Barber or service not found." });
    }
    if (error.message === "SLOT_NOT_AVAILABLE") {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked or on hold.",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getCustomerBookings = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerBookings", () =>
    getMyBookings(userId, req.query),
  );
};

export const getCustomerBookingById = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerBookingById", () =>
    getBookingById(userId, req.params.bookingId),
  );
};

export const cancelCustomerBooking = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "cancelCustomerBooking", () =>
    cancelBooking(userId, req.params.bookingId, req.body),
  );
};

export const rescheduleCustomerBooking = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "rescheduleCustomerBooking", () =>
    rescheduleBooking(userId, req.params.bookingId, req.body),
  );
};

export const getCustomerUpcomingBookings = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerUpcomingBookings", () =>
    getUpcomingBookings(userId, req.query),
  );
};

export const getCustomerPastBookings = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerPastBookings", () =>
    getPastBookings(userId, req.query),
  );
};

export const getCustomerBookingStatus = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerBookingStatus", () =>
    getBookingStatus(userId, req.params.bookingId),
  );
};

export const getCustomerAppointmentCode = (req, res) => {
  const userId = getAuthUserId(req);

  if (!userId) return unauthorized(res);

  return run(res, "getCustomerAppointmentCode", () =>
    getAppointmentCode(userId, req.params.bookingId),
  );
};

export const getCancellationEligibility = (req, res) => {
  const userId = getAuthUserId(req);

  if (!userId) return unauthorized(res);

  return run(res, "checkCancellationEligibility", () =>
    checkCancellationEligibility(userId, req.params.bookingId),
  );
};

export const getCalculatedRefund = (req, res) => {
  const userId = getAuthUserId(req);

  if (!userId) return unauthorized(res);

  return run(res, "calculateRefund", () =>
    calculateRefund(userId, req.params.bookingId),
  );
};

export const getCustomerCancellationDetails = (req, res) => {
  const userId = getAuthUserId(req);

  if (!userId) return unauthorized(res);

  return run(res, "getCancellationDetails", () =>
    getCancellationDetails(userId, req.params.bookingId),
  );
};

export const getCustomerRefundStatus = (req, res) => {
  const userId = getAuthUserId(req);

  if (!userId) return unauthorized(res);

  return run(res, "getRefundStatus", () =>
    getRefundStatus(userId, req.params.bookingId),
  );
};

export const acceptBarberBooking = async (req, res) => {
  try {
    const barberUserId = getAuthUserId(req);
    if (!barberUserId) return unauthorized(res);

    const result = await bookingActionService.acceptBooking(
      barberUserId,
      req.params.bookingId,
    );
    return res
      .status(200)
      .json({ success: true, message: result.message, data: result });
  } catch (error) {
    if (error.message === "BOOKING_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (error.message === "INVALID_STATE")
      return res
        .status(400)
        .json({ success: false, message: "Booking is not in PENDING state" });
    if (error.message === "TIMER_EXPIRED")
      return res.status(400).json({
        success: false,
        message: "Timer expired. Booking is now EXPIRED.",
      });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const rejectBarberBooking = async (req, res) => {
  try {
    const barberUserId = getAuthUserId(req);
    if (!barberUserId) return unauthorized(res);

    const result = await bookingActionService.rejectBooking(
      barberUserId,
      req.params.bookingId,
      req.body.reason,
    );
    return res
      .status(200)
      .json({ success: true, message: result.message, data: result });
  } catch (error) {
    if (error.message === "BOOKING_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (error.message === "INVALID_STATE")
      return res
        .status(400)
        .json({ success: false, message: "Booking is not in PENDING state" });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const payBookingDeposit = async (req, res) => {
  try {
    const customerId = getAuthUserId(req);
    if (!customerId) return unauthorized(res);

    const result = await bookingActionService.payDeposit(
      customerId,
      req.params.bookingId,
    );
    return res
      .status(200)
      .json({ success: true, message: result.message, data: result });
  } catch (error) {
    if (error.message === "BOOKING_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (error.message === "INVALID_STATE")
      return res
        .status(400)
        .json({ success: false, message: "Booking is not ACCEPTED" });
    if (error.message === "TIMER_EXPIRED")
      return res.status(400).json({
        success: false,
        message: "Timer expired. Booking is now EXPIRED.",
      });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const createOffPeakBookingHandler = async (req, res) => {
  try {
    const customerId = getAuthUserId(req);
    const result = await offPeakBookingService.createOffPeakBooking(
      customerId,
      req.body,
    );
    return res
      .status(201)
      .json({ success: true, message: result.message, data: result });
  } catch (error) {
    if (
      error.message === "BARBER_NOT_FOUND" ||
      error.message === "INVALID_SERVICES"
    )
      return res
        .status(404)
        .json({ success: false, message: "Barber or service not found." });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const respondToOffPeakBookingHandler = async (req, res) => {
  try {
    const barberUserId = getAuthUserId(req);
    const { action, reason } = req.body; // action: "ACCEPT" or "REJECT"

    const result = await offPeakBookingService.barberRespondToOffPeak(
      barberUserId,
      req.params.bookingId,
      action,
      reason,
    );
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    if (error.message === "BOOKING_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (error.message === "INVALID_STATE")
      return res
        .status(400)
        .json({ success: false, message: "Booking is not pending approval" });
    if (error.message === "TOO_LATE_TO_ACT")
      return res
        .status(400)
        .json({
          success: false,
          message: "Less than 1 hour left for booking. Auto-cancelled.",
        });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};