import express from "express";
import { GetSchedule, SetSchedule } from "../controller/barberController.js";
import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js"; 
import { ROLES } from "../config/role.js";

const router = express.Router();

router.use(authenticate);
router.use(requiredRoles(ROLES.BARBER));

router.get("/schedule", GetSchedule);
router.post("/schedule", SetSchedule);

export default router;