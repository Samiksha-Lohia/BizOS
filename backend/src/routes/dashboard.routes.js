import express from "express";
import { getOwnerDashboard, getReports } from "../controllers/dashboard.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", authorizeRoles("Admin", "Manager"), getOwnerDashboard);
router.get("/reports", authorizeRoles("Admin", "Manager", "Accountant"), getReports);

export default router;
