import express from "express";
import {
  getSuperAdminStats,
  getAllAdmins,
  getAdminDetail,
  updateSubscription,
} from "../controllers/superAdmin.controller.js";
import { updateProfile } from "../controllers/auth.controller.js";
import { protect, requireSuperAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication + SuperAdmin role
router.use(protect, requireSuperAdmin);

router.get("/stats", getSuperAdminStats);
router.get("/admins", getAllAdmins);
router.get("/admins/:adminId", getAdminDetail);
router.put("/admins/:adminId/subscription", updateSubscription);
router.put("/profile", updateProfile);

export default router;
