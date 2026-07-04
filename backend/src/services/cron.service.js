import Attendance from "../models/Attendance.model.js";
import Employee from "../models/Employee.model.js";

/**
 * Checks out any employees who forgot to check out on any past dates.
 * Sets their checkout time to their shift end time (or fallback to "18:00") and sets overtime to 0.
 */
export const autoCheckoutPendingEmployees = async () => {
  console.log("🕒 Running automatic checkout check for all past pending attendances...");
  
  const todayStr = new Date().toISOString().split("T")[0];

  try {
    // Find all records from dates BEFORE today that have no check-out
    const pendingRecords = await Attendance.find({
      date: { $lt: todayStr },
      status: { $in: ["Present", "Half Day"] },
      $or: [
        { timeOut: { $exists: false } },
        { timeOut: null },
        { timeOut: "" }
      ]
    });

    if (pendingRecords.length > 0) {
      console.log(`🔍 Found ${pendingRecords.length} pending past checkouts before today (${todayStr}).`);
    }

    for (const record of pendingRecords) {
      const employee = await Employee.findById(record.employeeId);
      const shiftEnd = employee?.shiftTimings?.end || "18:00";
      
      record.timeOut = shiftEnd;
      record.overtimeHours = 0; // Auto-checkout gets no overtime
      
      await record.save();
      console.log(`✅ Auto checked-out employee ${employee?.name || record.employeeId} on ${record.date} at shift end: ${shiftEnd}`);
    }
  } catch (error) {
    console.error("🔴 Error running automatic checkout:", error);
  }
};

/**
 * Schedules the automatic checkout job to run at exactly 12:00 AM (midnight) every day.
 */
export const scheduleMidnightCheckout = () => {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0); // 12 AM tomorrow
  const msToMidnight = nextMidnight - now;

  console.log(`🕒 Scheduled next automatic checkout in ${(msToMidnight / 3600000).toFixed(2)} hours (at 12:00 AM)`);

  setTimeout(async () => {
    try {
      await autoCheckoutPendingEmployees();
    } catch (err) {
      console.error("Auto checkout error:", err);
    }
    // Re-schedule for next midnight
    scheduleMidnightCheckout();
  }, msToMidnight);
};
