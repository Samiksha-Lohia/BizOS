import Product from "../models/Product.model.js";
import Invoice from "../models/Invoice.model.js";
import Customer from "../models/Customer.model.js";
import Expense from "../models/Expense.model.js";
import Attendance from "../models/Attendance.model.js";
import Employee from "../models/Employee.model.js";

export const getOwnerDashboard = async (req, res) => {
  const businessId = req.user.businessId;

  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday);
    endOfYesterday.setMilliseconds(-1);

    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const todayInvoices = await Invoice.find({
      businessId,
      createdAt: { $gte: startOfToday },
      status: { $ne: "Returned" },
    });
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const yesterdayInvoices = await Invoice.find({
      businessId,
      createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
      status: { $ne: "Returned" },
    });
    const yesterdaySales = yesterdayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const debtors = await Customer.find({
      businessId,
      outstandingBalance: { $gt: 0 },
    })
      .sort({ outstandingBalance: -1 })
      .limit(5);

    const outstandingReceivables = debtors.reduce((sum, c) => sum + c.outstandingBalance, 0);

    const lowStockAlerts = await Product.find({
      businessId,
      $expr: { $lte: ["$stockQuantity", "$minStockLevel"] },
    }).limit(10);

    const todayExpensesList = await Expense.find({
      businessId,
      date: { $gte: startOfToday },
      status: "Approved",
    });
    const todayExpenses = todayExpensesList.reduce((sum, exp) => sum + exp.amount, 0);

    const totalEmployeesCount = await Employee.countDocuments({ businessId, status: "Active" });
    const todayAttendance = await Attendance.find({
      businessId,
      date: todayStr,
    });
    const presentCount = todayAttendance.filter(a => ["Present", "Half Day"].includes(a.status)).length;
    const absentCount = totalEmployeesCount - presentCount;

    const monthlyInvoices = await Invoice.find({
      businessId,
      createdAt: { $gte: startOfMonth },
      status: { $ne: "Returned" },
    });
    const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const monthlyExpensesList = await Expense.find({
      businessId,
      date: { $gte: startOfMonth },
      status: "Approved",
    });
    const monthlyExpenses = monthlyExpensesList.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyProfitLoss = monthlyRevenue - monthlyExpenses;

    const productSales = {};
    monthlyInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const prodId = item.productId.toString();
        if (!productSales[prodId]) {
          productSales[prodId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[prodId].quantity += item.quantity;
        productSales[prodId].revenue += item.total;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topCustomers = await Customer.find({ businessId })
      .sort({ loyaltyPoints: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        todaySales,
        yesterdaySales,
        outstandingReceivables,
        topDebtors: debtors.map(d => ({ name: d.name, amount: d.outstandingBalance })),
        lowStockAlertsCount: lowStockAlerts.length,
        lowStockAlerts: lowStockAlerts.map(p => ({ name: p.name, quantity: p.stockQuantity, minLevel: p.minStockLevel })),
        todayExpenses,
        employeeAttendance: {
          total: totalEmployeesCount,
          present: presentCount,
          absent: absentCount,
        },
        monthlySnapshot: {
          revenue: monthlyRevenue,
          expenses: monthlyExpenses,
          profitOrLoss: monthlyProfitLoss,
        },
        topProducts,
        topCustomers: topCustomers.map(c => ({ name: c.name, loyaltyPoints: c.loyaltyPoints })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  const { type, startDate, endDate } = req.query;
  const businessId = req.user.businessId;

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  // Set end to end-of-day so the full chosen date is included in range queries
  let end;
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date();
  }

  try {
    if (type === "sales") {
      const invoices = await Invoice.find({
        businessId,
        createdAt: { $gte: start, $lte: end },
        status: { $ne: "Returned" },
      }).populate("customerId");

      return res.status(200).json({ success: true, data: invoices });
    }

    if (type === "inventory") {
      const products = await Product.find({ businessId });
      const valuation = products.reduce((sum, p) => sum + (p.stockQuantity * p.purchasePrice), 0);
      const retailValuation = products.reduce((sum, p) => sum + (p.stockQuantity * p.sellingPrice), 0);

      return res.status(200).json({
        success: true,
        data: {
          productsCount: products.length,
          totalCostValuation: valuation,
          totalRetailValuation: retailValuation,
          items: products,
        },
      });
    }

    if (type === "gst") {
      const invoices = await Invoice.find({
        businessId,
        createdAt: { $gte: start, $lte: end },
        status: { $ne: "Returned" },
      });

      const totalTax = invoices.reduce((sum, inv) => sum + inv.taxTotal, 0);
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;

      return res.status(200).json({
        success: true,
        data: {
          period: { start, end },
          totalSalesAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          taxableValue: invoices.reduce((sum, inv) => sum + inv.subtotal, 0),
          totalGstCollected: totalTax,
          cgst,
          sgst,
        },
      });
    }

    return res.status(400).json({ success: false, message: "Invalid or missing report type. Select 'sales', 'inventory', or 'gst'" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
