import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found with this token" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || "none"}) is not allowed to access this resource`,
      });
    }
    next();
  };
};

// Only SuperAdmin can access
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SuperAdmin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super Admin credentials required.",
    });
  }
  next();
};

// Block SuperAdmin from regular business routes
export const blockSuperAdmin = (req, res, next) => {
  if (req.user?.role === "SuperAdmin") {
    return res.status(403).json({
      success: false,
      message: "Super Admin cannot access business-level modules.",
    });
  }
  next();
};
