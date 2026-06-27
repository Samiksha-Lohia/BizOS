import express from "express";
import {
  createExpense,
  getExpenses,
  approveExpense,
  getProfitLoss,
} from "../controllers/expense.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Admin", "Manager", "Staff"), createExpense);
router.get("/", authorizeRoles("Admin", "Manager", "Accountant"), getExpenses);
router.get("/profit-loss", authorizeRoles("Admin", "Manager", "Accountant"), getProfitLoss);
router.put("/:id/approve", authorizeRoles("Admin", "Manager"), approveExpense);

export default router;
