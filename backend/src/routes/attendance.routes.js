import express from "express";
import {
  checkIn,
  checkOut,
  getAttendance,
  getMyAttendance,
  getPayroll,
} from "../controllers/attendance.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/check-in", authorizeRoles("Admin", "Manager", "Staff", "Employee"), checkIn);
router.post("/check-out", authorizeRoles("Admin", "Manager", "Staff", "Employee"), checkOut);
router.get("/", authorizeRoles("Admin", "Manager", "Accountant"), getAttendance);
router.get("/my", authorizeRoles("Staff", "Employee"), getMyAttendance);
router.get("/payroll", authorizeRoles("Admin", "Accountant"), getPayroll);

export default router;
