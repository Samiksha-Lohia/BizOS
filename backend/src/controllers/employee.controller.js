import Employee from "../models/Employee.model.js";

export const createEmployee = async (req, res) => {
  try {
    const employeeData = {
      ...req.body,
      businessId: req.user.businessId,
    };
    const employee = await Employee.create(employeeData);
    return res.status(201).json({ success: true, data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ businessId: req.user.businessId });
    return res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      name: req.user.name,
      businessId: req.user.businessId,
      status: "Active",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee profile found linked to your account.",
      });
    }

    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { status: "Inactive" },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    return res.status(200).json({ success: true, message: "Employee deactivated successfully", data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
