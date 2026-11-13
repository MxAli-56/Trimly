import express from "express";
import { GetSchedule, SetSchedule, ToggleAvailability, AddLeave, GetLeaves, DeleteLeave } from "../controller/barberController.js";
import authenticate from "../middleware/Auth.js";
import { requiredRoles } from "../middleware/Access.js"; 
import { ROLES } from "../config/role.js";

const router = express.Router();

router.use(authenticate);
router.use(requiredRoles(ROLES.BARBER));

router.get("/schedule", GetSchedule);
router.post("/schedule", SetSchedule);
router.patch("/availability", ToggleAvailability);
router.post("/leaves", AddLeave);
router.get("/leaves", GetLeaves);
router.delete("/leaves/:leaveId", DeleteLeave);

export default router;