import express from "express";
import { createBusiness, getBusiness, updateBusiness } from "../controllers/business.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getBusiness);
router.post("/", authorizeRoles("Admin"), createBusiness);
router.put("/", authorizeRoles("Admin"), updateBusiness);

export default router;
