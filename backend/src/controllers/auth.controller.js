import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Business from "../models/Business.model.js";
import mongoose from "mongoose";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const signUp = async (req, res) => {
  const { name, email, password, role, phone, businessName, businessId, designation, superAdminId, plan } = req.body;

  // Block any attempt to register as SuperAdmin
  if (role === "SuperAdmin") {
    return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be registered." });
  }

  // Require Super Admin ID for Admin (business owner) registrations
  if (role === "Admin" || !role) {
    if (!superAdminId || superAdminId.trim() === "") {
      return res.status(400).json({ success: false, message: "Super Admin ID is required to register a business account." });
    }
    // Validate ObjectId format first
    if (!mongoose.Types.ObjectId.isValid(superAdminId.trim())) {
      return res.status(400).json({ success: false, message: "Invalid Super Admin ID format. Please check the ID and try again." });
    }
    // Verify the provided Super Admin ID exists in the database
    try {
      const superAdmin = await User.findOne({ _id: superAdminId.trim(), role: "SuperAdmin" });
      if (!superAdmin) {
        return res.status(400).json({ success: false, message: "Invalid Super Admin ID. Please contact your Super Admin for the correct ID." });
      }
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid Super Admin ID. Please check and try again." });
    }
  }

  // Non-Admin roles must join an existing business
  if (role && role !== "Admin" && (!businessId || !businessId.trim())) {
    return res.status(400).json({ success: false, message: "Business Link ID is required to join an existing business." });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    let validatedBusinessId = undefined;
    const trimmedBusinessId = businessId?.trim();
    if (trimmedBusinessId) {
      if (!mongoose.Types.ObjectId.isValid(trimmedBusinessId)) {
        return res.status(400).json({ success: false, message: "Invalid Business ID format." });
      }
      const businessExists = await Business.findById(trimmedBusinessId);
      if (!businessExists) {
        return res.status(400).json({ success: false, message: "Business ID not found." });
      }
      validatedBusinessId = trimmedBusinessId;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Admin",
      phone,
      businessId: validatedBusinessId,
      designation: (role === "Staff" || role === "Employee") ? (designation || null) : null,
    });

    let business = null;
    if (user.role === "Admin" && businessName) {
      const chosenPlan = ["Free", "Basic", "Pro", "Enterprise"].includes(plan) ? plan : "Free";
      business = await Business.create({
        name: businessName,
        owner: user._id,
        phone: user.phone,
        email: user.email,
        subscription: {
          plan: chosenPlan,
          status: chosenPlan === "Free" ? "Trial" : "Active",
          startDate: new Date(),
          endDate: chosenPlan === "Free" ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      user.businessId = business._id;
      await user.save();
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation || null,
        businessId: user.businessId,
        business,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let lookupEmail = email?.trim().toLowerCase();
    if (lookupEmail === "superadmin") {
      lookupEmail = "superadmin@bizos.internal";
    }

    const user = await User.findOne({ email: lookupEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const isSuperAdmin = user.role === "SuperAdmin";

    return res.status(200).json({
      success: true,
      token,
      isSuperAdmin,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation || null,
        businessId: isSuperAdmin ? null : user.businessId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.cookie("token", "none", {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000),
  });
  return res.status(200).json({ success: true, message: "User logged out successfully" });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("businessId");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
