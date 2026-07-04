import dotenv from "dotenv";
dotenv.config();

import app from "../app.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import { seedSuperAdmin } from "./seed/superAdmin.seed.js";
import { autoCheckoutPendingEmployees, scheduleMidnightCheckout } from "./services/cron.service.js";

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
  try {
    await connectDB();
    // Seed the SuperAdmin account
    await seedSuperAdmin();

    // Run boot check for auto-checkout and schedule daily midnight check
    await autoCheckoutPendingEmployees();
    scheduleMidnightCheckout();

    const server = app.listen(PORT, () => {
      console.log("─────────────────────────────────────────");
      console.log(`🚀  BizOS API running`);
      console.log(`    Environment : ${NODE_ENV}`);
      console.log(`    Port        : ${PORT}`);
      console.log(`    Health      : http://localhost:${PORT}/health`);
      console.log("─────────────────────────────────────────");
    });

    const shutdown = (signal) => {
      console.log(`\n🛑  ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log("✅  HTTP server closed.");
        try {
          await mongoose.connection.close();
          console.log("✅  MongoDB connection closed.");
          process.exit(0);
        } catch (err) {
          console.error("🔴  Error closing MongoDB connection:", err);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error("⚠️   Forced exit after timeout.");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      console.error("💥  Unhandled Promise Rejection:", reason);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error("💥  Uncaught Exception:", err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();