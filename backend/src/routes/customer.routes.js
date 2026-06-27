import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getPurchaseHistory,
  recordCustomerPayment,
} from "../controllers/customer.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Admin", "Manager", "Staff"), createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", authorizeRoles("Admin", "Manager", "Staff"), updateCustomer);
router.delete("/:id", authorizeRoles("Admin"), deleteCustomer);
router.get("/:id/purchases", getPurchaseHistory);
router.post("/:id/pay", authorizeRoles("Admin", "Manager", "Staff"), recordCustomerPayment);

export default router;
