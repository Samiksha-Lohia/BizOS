import Customer from "../models/Customer.model.js";
import Invoice from "../models/Invoice.model.js";

export const createCustomer = async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      businessId: req.user.businessId,
      createdBy: req.user._id,
    };
    const customer = await Customer.create(customerData);
    return res.status(201).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  const { search, tag } = req.query;
  const query = { businessId: req.user.businessId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }
  if (tag) {
    query.tags = tag;
  }

  try {
    const customers = await Customer.find(query);
    return res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    return res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchaseHistory = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      customerId: req.params.id,
      businessId: req.user.businessId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recordCustomerPayment = async (req, res) => {
  const { amount } = req.body;
  if (amount === undefined || amount <= 0) {
    return res.status(400).json({ success: false, message: "Please provide a valid payment amount." });
  }

  try {
    const customer = await Customer.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    // Find outstanding invoices for this customer, oldest first
    const invoices = await Invoice.find({
      customerId: customer._id,
      businessId: req.user.businessId,
      outstandingAmount: { $gt: 0 },
      status: { $ne: "Returned" },
    }).sort({ createdAt: 1 });

    let remaining = amount;
    const updatedInvoices = [];

    for (let invoice of invoices) {
      if (remaining <= 0) break;
      const unpaid = invoice.outstandingAmount;
      if (remaining >= unpaid) {
        invoice.paidAmount += unpaid;
        invoice.outstandingAmount = 0;
        invoice.status = "Paid";
        remaining -= unpaid;
      } else {
        invoice.paidAmount += remaining;
        invoice.outstandingAmount -= remaining;
        invoice.status = "Partially Paid";
        remaining = 0;
      }
      await invoice.save();
      updatedInvoices.push(invoice);
    }

    // Deduct the payment from customer's outstanding balance
    customer.outstandingBalance = Math.max(0, customer.outstandingBalance - amount);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: `Successfully recorded payment of ₹${amount}.`,
      data: {
        customer,
        allocatedAmount: amount - remaining,
        updatedInvoicesCount: updatedInvoices.length
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
