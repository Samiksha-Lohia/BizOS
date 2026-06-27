import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

const SUPER_ADMIN_EMAIL = "superadmin@bizos.internal";
const SUPER_ADMIN_PASSWORD = "admin123";

export const seedSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ role: "SuperAdmin" });
    if (existing) {
      console.log("✅  SuperAdmin already exists — skipping seed.");
      return;
    }

    await User.create({
      name: "Super Admin",
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      role: "SuperAdmin",
    });

    console.log("✅  SuperAdmin seeded successfully.");
    console.log(`    Email    : ${SUPER_ADMIN_EMAIL}`);
    console.log(`    Password : ${SUPER_ADMIN_PASSWORD}`);
  } catch (err) {
    console.error("🔴  Failed to seed SuperAdmin:", err.message);
  }
};
