import express from "express";
import {
  ReviewScheduleRequest,
  SetBarberSchedule,
  GetBarberSchedule,
  AddBarber,
  RemoveBarber,
} from "../controller/ownerController.js";
import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { validateBody, validateParams } from "../middleware/validateBody.js";
import { ROLES } from "../config/role.js";

// Validations
import { reviewScheduleSchema } from "../validation/schedule/scheduleRequestValidation.js";
import { ownerSetScheduleSchema } from "../validation/schedule/ownerScheduleValidation.js";
import { barberProfileIdParamSchema } from "../validation/schedule/paramValidation.js";
import { addBarberSchema, removeBarberSchema } from "../validation/owner/barberManagementValidation.js";

const router = express.Router();

router.use(authenticate);
router.use(requiredRoles(ROLES.SALON_OWNER));

// ==========================================
// Barber Management
// ==========================================
router.post("/barbers/add", validateBody(addBarberSchema), AddBarber);
router.patch("/barbers/:barberProfileId/remove", validateParams(barberProfileIdParamSchema), validateBody(removeBarberSchema), RemoveBarber);

// ==========================================
// Schedule Approval
// ==========================================
router.patch("/schedule/approve-request/:requestId", validateBody(reviewScheduleSchema), ReviewScheduleRequest);

// ==========================================
// Owner Sets Barber Schedule
// ==========================================
router.get("/barbers/:barberProfileId/schedule", validateParams(barberProfileIdParamSchema), GetBarberSchedule);
router.post("/barbers/:barberProfileId/schedule", validateParams(barberProfileIdParamSchema), validateBody(ownerSetScheduleSchema), SetBarberSchedule);

export default router;