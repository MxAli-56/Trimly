import express from "express";
import {
  GetSchedule,
  SetSchedule,
  ToggleAvailability,
  AddLeave,
  GetLeaves,
  DeleteLeave
} from "../controller/barberController.js";
import {GetDailyTimeline} from "../controller/bookingController.js"
import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { validateBody } from "../middleware/validateBody.js";
import { ROLES } from "../config/role.js";

// Validations Import
import { setScheduleSchema } from "../validation/barber/scheduleValidation.js";
import { toggleAvailabilitySchema } from "../validation/barber/availabilityValidation.js";
import { addLeaveSchema } from "../validation/barber/leaveValidation.js";

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
router.delete("/leaves/:leaveId", DeleteLeave);

// Dashboard / Calendar View Route
router.get("/dashboard/timeline", GetDailyTimeline);

export default router;