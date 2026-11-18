import express from "express";
import { ReviewScheduleRequest } from "../controller/ownerController.js";
import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js";
import { ROLES } from "../config/role.js";

const router = express.Router();
router.use(authenticate);
router.use(requiredRoles(ROLES.SALON_OWNER));

router.patch("/schedule/requests/:requestId", ReviewScheduleRequest);

export default router;