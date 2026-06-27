import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Employee role/designation is required"],
      trim: true,
    },
    salaryDetails: {
      baseSalary: {
        type: Number,
        required: [true, "Base salary is required"],
        min: 0,
      },
      overtimeRate: {
        type: Number,
        default: 0, // Hourly overtime payout rate
      },
      workingHours: {
        type: Number,
        default: 8, // Standard daily working hours
      },
    },
    shiftTimings: {
      start: {
        type: String,
        default: "09:00", // HH:MM
      },
      end: {
        type: String,
        default: "18:00", // HH:MM
      },
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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

employeeSchema.index({ businessId: 1, name: 1 });

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
