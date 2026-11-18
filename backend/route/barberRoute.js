import express from "express";
import {
  GetSchedule,
  SetSchedule,
  ToggleAvailability,
  AddLeave,
  GetLeaves,
  DeleteLeave,
  GetUpcomingBookings,
  GetDailyTimeline,
  GetTodayAppointments,
  GetCompletedBookings,
  GetMyProfile,
  UpdateMyProfile,
  RequestScheduleUpdate,
  GetScheduleRequests,
} from "../controller/barberController.js";

import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validateBody.js";
import { ROLES } from "../config/role.js";

// Validations Import
import { setScheduleSchema } from "../validation/barber/scheduleValidation.js";
import { toggleAvailabilitySchema } from "../validation/barber/availabilityValidation.js";
import { addLeaveSchema } from "../validation/barber/leaveValidation.js";
import { timelineQuerySchema, paginationQuerySchema } from "../validation/barber/queryValidation.js";
import { leaveIdParamSchema } from "../validation/barber/paramsValidation.js";
import { updateProfileSchema } from "../validation/barber/profileValidation.js"; // Profile validation

const router = express.Router();

// Apply Auth & RBAC to all routes in this file
router.use(authenticate);
router.use(requiredRoles(ROLES.BARBER));

// ==========================================
// PHASE 1: FOUNDATION (Schedule & Availability)
// ==========================================
router.get("/schedule", GetSchedule);
router.post("/schedule", validateBody(setScheduleSchema), SetSchedule);
router.patch("/availability", validateBody(toggleAvailabilitySchema), ToggleAvailability);
router.post("/leaves", validateBody(addLeaveSchema), AddLeave);
router.get("/leaves", GetLeaves);
router.delete("/leaves/:leaveId", validateParams(leaveIdParamSchema), DeleteLeave);

// ==========================================
// PHASE 3: DASHBOARD & OPERATIONS
// ==========================================
// 1. Dashboard (Calendar View)
router.get("/dashboard/timeline", validateQuery(timelineQuerySchema), GetDailyTimeline);

// 2. Appointments Tab
router.get("/appointments/today", GetTodayAppointments);
router.get("/bookings/upcoming", validateQuery(paginationQuerySchema), GetUpcomingBookings); 
router.get("/bookings/completed", validateQuery(paginationQuerySchema), GetCompletedBookings);

// 3. Profile Tab
router.get("/profile", GetMyProfile);
router.put("/profile", validateBody(updateProfileSchema), UpdateMyProfile);

// Barber Schedule
router.post("/schedule/send-request", RequestScheduleUpdate);
router.get("/schedule/my-requests", GetScheduleRequests);

export default router;