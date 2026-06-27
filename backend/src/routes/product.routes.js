import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  adjustStock,
} from "../controllers/product.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authorizeRoles("Admin", "Manager", "Staff"), createProduct);
router.put("/:id", authorizeRoles("Admin", "Manager"), updateProduct);
router.delete("/:id", authorizeRoles("Admin"), deleteProduct);
router.post("/:id/stock", authorizeRoles("Admin", "Manager", "Staff"), adjustStock);

export default router;
