import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  processReturn,
  recordPayment,
} from "../controllers/invoice.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Admin", "Manager", "Staff"), createInvoice);
router.get("/", getInvoices);
router.get("/:id", getInvoiceById);
router.post("/:id/return", authorizeRoles("Admin", "Manager"), processReturn);
router.post("/:id/pay", authorizeRoles("Admin", "Manager", "Staff"), recordPayment);

export default router;
