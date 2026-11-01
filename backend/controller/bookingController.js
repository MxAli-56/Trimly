import { createBooking } from "../services/booking/createBookingService.js";

import { getUpcomingBookings } from "../services/booking/upcomingBookingService.js";

import { getPastBookings } from "../services/booking/pastBookingService.js";

import { getBookingStatus } from "../services/booking/bookingStatusService.js";

import { getAppointmentCode } from "../services/booking/appointmentCodeService.js";

import { checkCancellationEligibility } from "../services/booking/cancellationEligibilityService.js";

import {
  getMyBookings,
  getBookingById,
} from "../services/booking/getBookingService.js";

import { cancelBooking } from "../services/booking/cancelBookingService.js";

import {
  rescheduleBooking,
} from "../services/booking/rescheduleBookingService.js";

const getAuthUserId = (req) =>
  req.user?.id ?? req.user?._id ?? req.userId;

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

export const createCustomerBooking = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(
    res,
    "createCustomerBooking",
    () => createBooking(userId, req.body),
    201
  );
};

export const getCustomerBookings = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerBookings", () =>
    getMyBookings(userId, req.query)
  );
};

export const getCustomerBookingById = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerBookingById", () =>
    getBookingById(userId, req.params.bookingId)
  );
};

export const cancelCustomerBooking = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "cancelCustomerBooking", () =>
    cancelBooking(userId, req.params.bookingId, req.body)
  );
};

export const rescheduleCustomerBooking = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "rescheduleCustomerBooking", () =>
    rescheduleBooking(userId, req.params.bookingId, req.body)
  );
};

export const getCustomerUpcomingBookings = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerUpcomingBookings", () =>
    getUpcomingBookings(userId, req.query)
  );
};

export const getCustomerPastBookings = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerPastBookings", () =>
    getPastBookings(userId, req.query)
  );
};

export const getCustomerBookingStatus = (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorized(res);

  return run(res, "getCustomerBookingStatus", () =>
    getBookingStatus(userId, req.params.bookingId)
  );
};

export const getCustomerAppointmentCode = (req, res) => {
  const userId = getAuthUserId(req);

  if (!userId) return unauthorized(res);

  return run(res, "getCustomerAppointmentCode", () =>
    getAppointmentCode(userId, req.params.bookingId)
  );
};


export const getCancellationEligibility = (req, res) => {
  const userId = getAuthUserId(req);

  if (!userId) return unauthorized(res);

  return run(res, "checkCancellationEligibility", () =>
    checkCancellationEligibility(
      userId,
      req.params.bookingId
    )
  );
};