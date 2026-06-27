import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Half Day"],
      default: "Present",
    },
    timeIn: {
      type: String, // HH:MM
    },
    timeOut: {
      type: String, // HH:MM
    },
    selfieUrl: {
      type: String, // Verification selfie
    },
    gpsCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    overtimeHours: {
      type: Number,
      default: 0,
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

// Compound index to ensure one attendance entry per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ businessId: 1, date: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
