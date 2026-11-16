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
import { leaveIdParamSchema } from "../validation/barber/paramValidation.js";

const router = express.Router();

// Apply Auth & RBAC to all routes in this file
router.use(authenticate);
router.use(requiredRoles(ROLES.BARBER));

// Schedule Routes
router.get("/schedule", GetSchedule);
router.post("/schedule", validateBody(setScheduleSchema), SetSchedule);

// Availability Route
router.patch(
  "/availability",
  validateBody(toggleAvailabilitySchema),
  ToggleAvailability,
);

// Leave Routes
router.post("/leaves", validateBody(addLeaveSchema), AddLeave);
router.get("/leaves", GetLeaves);
router.delete("/leaves/:leaveId", validateParams(leaveIdParamSchema), DeleteLeave);

// Dashboard / Calendar View Route (Query Validation added)
router.get("/dashboard/timeline", validateQuery(timelineQuerySchema), GetDailyTimeline);

// Upcoming & Completed Bookings (Query Validation added)
router.get("/bookings/upcoming", validateQuery(paginationQuerySchema), GetUpcomingBookings); 
router.get("/bookings/completed", validateQuery(paginationQuerySchema), GetCompletedBookings);

export default router;