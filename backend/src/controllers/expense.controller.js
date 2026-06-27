import Expense from "../models/Expense.model.js";
import Invoice from "../models/Invoice.model.js";

export const createExpense = async (req, res) => {
  const { category, amount, date, description, receiptUrl, employeeId } = req.body;

  try {
    const businessId = req.user.businessId;

    const isAdminOrManager = ["Admin", "Manager"].includes(req.user.role);
    const status = isAdminOrManager ? "Approved" : "Pending";
    const reimbursementStatus = employeeId ? "Pending" : "N/A";

    const expense = await Expense.create({
      category,
      amount,
      date: date || new Date(),
      description,
      receiptUrl,
      status,
      employeeId,
      reimbursementStatus,
      approvedBy: isAdminOrManager ? req.user._id : undefined,
      businessId,
    });

    return res.status(201).json({ success: true, data: expense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  const { category, status, startDate, endDate } = req.query;
  const query = { businessId: req.user.businessId };

  if (category) {
    query.category = category;
  }
  if (status) {
    query.status = status;
  }
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  try {
    const expenses = await Expense.find(query)
      .populate("employeeId")
      .populate("approvedBy", "name email")
      .sort({ date: -1 });

    return res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveExpense = async (req, res) => {
  const { status, reimbursementStatus } = req.body;

  try {
    // Validate that the expense belongs to this business first
    const existing = await Expense.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Expense record not found" });
    }

    // Build the update object — only include fields that are being changed
    const updateFields = {};
    if (status) {
      updateFields.status = status;
      updateFields.approvedBy = req.user._id;
    }
    if (reimbursementStatus) {
      updateFields.reimbursementStatus = reimbursementStatus;
    }

    // Use findOneAndUpdate to avoid triggering full Mongoose validation
    // on untouched fields (which can cause 500 errors on legacy documents)
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: updateFields },
      { new: true, runValidators: false }
    ).populate("employeeId").populate("approvedBy", "name email");

    return res.status(200).json({ success: true, data: updatedExpense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfitLoss = async (req, res) => {
  const { startDate, endDate } = req.query;
  const businessId = req.user.businessId;

  const invoiceQuery = { businessId, status: { $ne: "Returned" } };
  const expenseQuery = { businessId, status: "Approved" };

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    invoiceQuery.createdAt = { $gte: start, $lte: end };
    expenseQuery.date = { $gte: start, $lte: end };
  }

  try {
    const invoices = await Invoice.find(invoiceQuery);
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCostOfGoodsSold = invoices.reduce((sum, inv) => {
      return sum + inv.items.reduce((itemSum, item) => itemSum + (item.purchasePrice * item.quantity), 0);
    }, 0);

    const expenses = await Expense.find(expenseQuery);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const grossProfit = totalRevenue - totalCostOfGoodsSold;
    const netProfit = grossProfit - totalExpenses;

    const categoryBreakdown = {};
    expenses.forEach((exp) => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    return res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: startDate || "All time",
          endDate: endDate || "All time",
        },
        financials: {
          totalRevenue,
          totalCostOfGoodsSold,
          grossProfit,
          totalExpenses,
          netProfit,
        },
        expenseBreakdown: categoryBreakdown,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
