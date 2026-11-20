import express from "express";
import {
  ReviewScheduleRequest,
  SetBarberSchedule,
  GetBarberSchedule,
} from "../controller/ownerController.js";
import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { validateBody, validateParams } from "../middleware/validateBody.js";
import { ROLES } from "../config/role.js";

// Validations
import { reviewScheduleSchema } from "../validation/schedule/scheduleRequestValidation.js";
import { ownerSetScheduleSchema } from "../validation/schedule/ownerScheduleValidation.js"; // Naya validation
import { barberProfileIdParamSchema } from "../validation/schedule/paramValidation.js"; // Naya validation

const router = express.Router();

router.use(authenticate);
router.use(requiredRoles(ROLES.SALON_OWNER));

// ==========================================
// Schedule Approval (Owner reviews barber's request)
// ==========================================
router.patch("/schedule/approve-request/:requestId", validateBody(reviewScheduleSchema), ReviewScheduleRequest);

// ==========================================
// Owner Sets Barber Schedule (Instant Apply)
// ==========================================
router.get("/barbers/:barberProfileId/schedule", validateParams(barberProfileIdParamSchema), GetBarberSchedule);

router.post("/barbers/:barberProfileId/schedule", validateParams(barberProfileIdParamSchema), validateBody(ownerSetScheduleSchema), SetBarberSchedule);

export default router;