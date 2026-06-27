import Attendance from "../models/Attendance.model.js";
import Employee from "../models/Employee.model.js";

export const checkIn = async (req, res) => {
  const { employeeId, date, timeIn, status, selfieUrl, gpsCoordinates } = req.body;

  try {
    const businessId = req.user.businessId;

    const employee = await Employee.findOne({ _id: employeeId, businessId });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    if (["Staff", "Employee"].includes(req.user.role) && employee.name !== req.user.name) {
      return res.status(403).json({ success: false, message: "Employees can only mark their own attendance" });
    }

    const existing = await Attendance.findOne({ employeeId, date });
    if (existing) {
      return res.status(400).json({ success: false, message: "Attendance already logged for this day" });
    }

    const attendance = await Attendance.create({
      employeeId,
      date,
      status: status || "Present",
      timeIn: timeIn || new Date().toTimeString().split(" ")[0].substring(0, 5),
      selfieUrl,
      gpsCoordinates,
      businessId,
    });

    return res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req, res) => {
  const { employeeId, date, timeOut } = req.body;

  try {
    const businessId = req.user.businessId;

    const attendance = await Attendance.findOne({ employeeId, date, businessId });
    if (!attendance) {
      return res.status(404).json({ success: false, message: "No check-in record found for this day" });
    }

    if (["Staff", "Employee"].includes(req.user.role)) {
      const employee = await Employee.findOne({ _id: employeeId, businessId });
      if (!employee || employee.name !== req.user.name) {
        return res.status(403).json({ success: false, message: "Employees can only update their own attendance" });
      }
    }

    attendance.timeOut = timeOut || new Date().toTimeString().split(" ")[0].substring(0, 5);

    if (attendance.timeIn && attendance.timeOut) {
      const employee = await Employee.findById(employeeId);
      if (employee) {
        const [inH, inM] = attendance.timeIn.split(":").map(Number);
        const [outH, outM] = attendance.timeOut.split(":").map(Number);

        const hoursWorked = (outH + outM / 60) - (inH + inM / 60);
        const standardHours = employee.salaryDetails.workingHours || 8;

        if (hoursWorked > standardHours) {
          attendance.overtimeHours = Math.round((hoursWorked - standardHours) * 100) / 100;
        }
      }
    }

    await attendance.save();
    return res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendance = async (req, res) => {
  const { date, startDate, endDate, employeeId } = req.query;
  const query = { businessId: req.user.businessId };

  if (employeeId) {
    query.employeeId = employeeId;
  }

  if (date) {
    query.date = date;
  } else if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  try {
    const records = await Attendance.find(query).populate("employeeId");
    return res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Staff can only view their own attendance — matched by name in Employee collection
export const getMyAttendance = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    // Find the employee record whose name matches the logged-in user's name
    const employee = await Employee.findOne({ name: req.user.name, businessId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee profile found linked to your account. Contact your manager.",
      });
    }

    const { date, startDate, endDate } = req.query;
    const query = { employeeId: employee._id, businessId };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query).populate("employeeId");
    return res.status(200).json({ success: true, employee, count: records.length, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getPayroll = async (req, res) => {
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ success: false, message: "Month parameter (YYYY-MM) is required" });
  }

  try {
    const businessId = req.user.businessId;
    const employees = await Employee.find({ businessId, status: "Active" });

    const payroll = [];

    for (const emp of employees) {
      const records = await Attendance.find({
        employeeId: emp._id,
        date: { $regex: `^${month}` },
      });

      const daysPresent = records.filter(r => r.status === "Present").length;
      const daysHalfDay = records.filter(r => r.status === "Half Day").length;
      const daysLeave = records.filter(r => r.status === "Leave").length;
      const daysAbsent = records.filter(r => r.status === "Absent").length;

      const totalOvertime = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

      const baseSalary = emp.salaryDetails.baseSalary;
      const overtimeRate = emp.salaryDetails.overtimeRate || 0;
      const overtimePay = totalOvertime * overtimeRate;

      const dailyRate = baseSalary / 30;
      const deductions = (daysAbsent * dailyRate) + (daysHalfDay * dailyRate * 0.5);

      const netSalary = Math.round(baseSalary + overtimePay - deductions);

      payroll.push({
        employee: {
          id: emp._id,
          name: emp.name,
          role: emp.role,
        },
        month,
        summary: {
          present: daysPresent,
          halfDay: daysHalfDay,
          leave: daysLeave,
          absent: daysAbsent,
          overtimeHours: totalOvertime,
        },
        baseSalary,
        overtimePay,
        deductions: Math.round(deductions),
        netSalary: Math.max(0, netSalary),
      });
    }

    return res.status(200).json({ success: true, count: payroll.length, data: payroll });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
