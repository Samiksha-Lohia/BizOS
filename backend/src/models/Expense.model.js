import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Expense category is required"],
      enum: ["Rent", "Salaries", "Utilities", "Raw Materials", "Transport", "Marketing", "Misc"],
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: 0,
    },
    date: {
      type: Date,
      required: [true, "Expense date is required"],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String, // Bill attachment
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved", // Auto-approved if created by Admin
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Populate if spent by employee (reimbursement claim)
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reimbursementStatus: {
      type: String,
      enum: ["N/A", "Pending", "Reimbursed"],
      default: "N/A",
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ businessId: 1, date: -1 });
expenseSchema.index({ businessId: 1, category: 1 });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
