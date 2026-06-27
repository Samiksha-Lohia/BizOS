import express from "express";
import {
  createEmployee,
  getEmployees,
  getMyEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Admin", "Manager"), createEmployee);
router.get("/me", authorizeRoles("Staff", "Employee"), getMyEmployee);
router.get("/", authorizeRoles("Admin", "Manager", "Accountant"), getEmployees);
router.put("/:id", authorizeRoles("Admin", "Manager"), updateEmployee);
router.delete("/:id", authorizeRoles("Admin"), deleteEmployee);

export default router;
