import express from "express";
import {
  GetSchedule,
  ToggleAvailability,
  AddLeave,
  GetLeaves,
  DeleteLeave,
  GetUpcomingBookings,
  GetDailyTimeline,
  GetTodayAppointments,
  GetMyProfile,
  UpdateMyProfile,
  GetCompletedBookings,
  RequestScheduleUpdate,
  GetScheduleRequests,
} from "../controller/barberController.js";
import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validateBody.js";
import { ROLES } from "../config/role.js";

// Validations
import { toggleAvailabilitySchema } from "../validation/barber/availabilityValidation.js";
import { addLeaveSchema } from "../validation/barber/leaveValidation.js";
import { timelineQuerySchema, paginationQuerySchema } from "../validation/barber/queryValidation.js";
import { leaveIdParamSchema } from "../validation/barber/paramsValidation.js";
import { updateProfileSchema } from "../validation/barber/profileValidation.js";
import { createScheduleRequestSchema } from "../validation/schedule/scheduleRequestValidation.js"; // Naya import

const router = express.Router();

router.use(authenticate);
router.use(requiredRoles(ROLES.BARBER));

// ==========================================
// PHASE 1: View Schedule only
// ==========================================
router.get("/schedule", GetSchedule); 

// Availability
router.patch("/availability", validateBody(toggleAvailabilitySchema), ToggleAvailability);

// Leaves
router.post("/leaves", validateBody(addLeaveSchema), AddLeave);
router.get("/leaves", GetLeaves);
router.delete("/leaves/:leaveId", validateParams(leaveIdParamSchema), DeleteLeave);

// ==========================================
// PHASE 3: Dashboard & Operations
// ==========================================
router.get("/dashboard/timeline", validateQuery(timelineQuerySchema), GetDailyTimeline);
router.get("/appointments/today", GetTodayAppointments);
router.get("/bookings/upcoming", validateQuery(paginationQuerySchema), GetUpcomingBookings);
router.get("/bookings/completed", validateQuery(paginationQuerySchema), GetCompletedBookings);

// Profile
router.get("/profile", GetMyProfile);
router.put("/profile", validateBody(updateProfileSchema), UpdateMyProfile);

// ==========================================
// PHASE 4: Schedule Request (Barber sends request to Owner)
// ==========================================
router.post("/schedule/send-request", validateBody(createScheduleRequestSchema), RequestScheduleUpdate);
router.get("/schedule/my-requests", GetScheduleRequests);

export default router;