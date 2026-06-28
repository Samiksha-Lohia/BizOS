import User from "../models/User.model.js";
import Business from "../models/Business.model.js";
import Employee from "../models/Employee.model.js";
import Invoice from "../models/Invoice.model.js";

// GET /superadmin/stats — summary counts
export const getSuperAdminStats = async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({ role: "Admin" });
    const businesses = await Business.find({});

    const activeSubscriptions = businesses.filter(
      (b) => b.subscription?.status === "Active"
    ).length;

    const expiredSubscriptions = businesses.filter(
      (b) => b.subscription?.status === "Expired"
    ).length;

    const trialSubscriptions = businesses.filter(
      (b) => b.subscription?.status === "Trial"
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        totalAdmins,
        totalBusinesses: businesses.length,
        activeSubscriptions,
        expiredSubscriptions,
        trialSubscriptions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /superadmin/admins — all Admin users with business + subscription
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "Admin" }).lean();

    const result = await Promise.all(
      admins.map(async (admin) => {
        const business = await Business.findOne({ owner: admin._id }).lean();
        const employeeCount = business
          ? await Employee.countDocuments({ businessId: business._id })
          : 0;

        return {
          adminId: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone || "—",
          registeredAt: admin.createdAt,
          business: business
            ? {
                businessId: business._id,
                name: business.name,
                gstin: business.gstin || "—",
                address: business.address || "—",
                phone: business.phone || "—",
                email: business.email || "—",
                subscription: business.subscription || {
                  plan: "Free",
                  status: "Trial",
                  startDate: null,
                  endDate: null,
                },
                createdAt: business.createdAt,
              }
            : null,
          employeeCount,
        };
      })
    );

    return res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /superadmin/admins/:adminId — detailed view of a single admin/business
export const getAdminDetail = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await User.findById(adminId).lean();

    if (!admin || admin.role !== "Admin") {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    const business = await Business.findOne({ owner: admin._id }).lean();

    const employees = business
      ? await Employee.find({ businessId: business._id }).lean()
      : [];

    const invoiceStats = business
      ? await Invoice.aggregate([
          { $match: { businessId: business._id } },
          {
            $group: {
              _id: null,
              totalInvoices: { $sum: 1 },
              totalRevenue: { $sum: "$totalAmount" },
              paidRevenue: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0] },
              },
            },
          },
        ])
      : [];

    const invoiceSummary = invoiceStats[0] || {
      totalInvoices: 0,
      totalRevenue: 0,
      paidRevenue: 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone || "—",
          registeredAt: admin.createdAt,
        },
        business: business
          ? {
              id: business._id,
              name: business.name,
              gstin: business.gstin || "—",
              address: business.address || "—",
              phone: business.phone || "—",
              email: business.email || "—",
              logo: business.logo || null,
              subscription: business.subscription || {
                plan: "Free",
                status: "Trial",
                startDate: null,
                endDate: null,
              },
              createdAt: business.createdAt,
            }
          : null,
        employees: employees.map((e) => ({
          id: e._id,
          name: e.name,
          role: e.role,
          status: e.status,
          joinDate: e.joinDate,
        })),
        employeeCount: employees.length,
        invoiceSummary,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /superadmin/admins/:adminId/subscription — update subscription
export const updateSubscription = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { plan, status, startDate, endDate } = req.body;

    const admin = await User.findById(adminId).lean();
    if (!admin || admin.role !== "Admin") {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    const business = await Business.findOneAndUpdate(
      { owner: adminId },
      {
        $set: {
          "subscription.plan": plan,
          "subscription.status": status,
          "subscription.startDate": startDate || null,
          "subscription.endDate": endDate || null,
        },
      },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found for this admin." });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully.",
      data: business.subscription,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
