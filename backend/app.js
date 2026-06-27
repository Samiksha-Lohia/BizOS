import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/auth.routes.js";
import businessRoutes from "./src/routes/business.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import customerRoutes from "./src/routes/customer.routes.js";
import invoiceRoutes from "./src/routes/invoice.routes.js";
import employeeRoutes from "./src/routes/employee.routes.js";
import attendanceRoutes from "./src/routes/attendance.routes.js";
import expenseRoutes from "./src/routes/expense.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import superAdminRoutes from "./src/routes/superAdmin.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
});

app.use("/api", apiLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BizOS API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

const API = "/api/v1";

import { protect, blockSuperAdmin } from "./src/middlewares/auth.middleware.js";

app.use(`${API}/auth`, authLimiter, authRoutes);
app.use(`${API}/superadmin`, superAdminRoutes);
// Business-level routes — block SuperAdmin from accessing
app.use(`${API}/business`, protect, blockSuperAdmin, businessRoutes);
app.use(`${API}/products`, protect, blockSuperAdmin, productRoutes);
app.use(`${API}/customers`, protect, blockSuperAdmin, customerRoutes);
app.use(`${API}/invoices`, protect, blockSuperAdmin, invoiceRoutes);
app.use(`${API}/employees`, protect, blockSuperAdmin, employeeRoutes);
app.use(`${API}/attendance`, protect, blockSuperAdmin, attendanceRoutes);
app.use(`${API}/expenses`, protect, blockSuperAdmin, expenseRoutes);
app.use(`${API}/dashboard`, protect, blockSuperAdmin, dashboardRoutes);
app.use(`${API}/upload`, uploadRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found. Please check the API documentation.",
  });
});

app.use((err, _req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("🔴 Unhandled error:", err);
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token has expired. Please log in again." });
  }

  if (err.message && err.message.startsWith("CORS policy")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error." : err.message,
  });
});

export default app;