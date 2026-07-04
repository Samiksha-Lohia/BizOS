import Invoice from "../models/Invoice.model.js";
import Product from "../models/Product.model.js";
import Customer from "../models/Customer.model.js";

export const createInvoice = async (req, res) => {
  const { customerId, items, paymentMode, paidAmount, dueDate } = req.body;

  try {
    const businessId = req.user.businessId;

    const customer = await Customer.findOne({ _id: customerId, businessId });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const count = await Invoice.countDocuments({ businessId });
    const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;

    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId });
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
        });
      }

      product.stockQuantity -= item.quantity;
      await product.save();

      const itemPrice = product.sellingPrice;
      const itemDiscount = item.discount || 0;
      const itemSubtotal = (itemPrice - itemDiscount) * item.quantity;

      const itemTaxRate = 18; // Default GST rate
      const itemTaxAmount = (itemSubtotal * itemTaxRate) / 100;
      const itemTotal = itemSubtotal + itemTaxAmount;

      subtotal += itemSubtotal;
      taxTotal += itemTaxAmount;
      discountTotal += (itemDiscount * item.quantity);

      processedItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        purchasePrice: product.purchasePrice,
        sellingPrice: itemPrice,
        discount: itemDiscount,
        taxRate: itemTaxRate,
        taxAmount: itemTaxAmount,
        total: itemTotal,
      });
    }

    const roundedSubtotal = Math.round(subtotal * 100) / 100;
    const roundedTaxTotal = Math.round(taxTotal * 100) / 100;
    const roundedDiscountTotal = Math.round(discountTotal * 100) / 100;
    const totalAmount = Math.round((roundedSubtotal + roundedTaxTotal) * 100) / 100;
    
    // Resolve paid amount
    let paid = 0;
    if (paidAmount !== undefined && paidAmount !== null && paidAmount !== "") {
      paid = Number(paidAmount);
    } else {
      paid = paymentMode === "Credit" ? 0 : totalAmount;
    }

    const roundedPaid = Math.round(paid * 100) / 100;

    if (roundedPaid > totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Paid amount (₹${paid}) cannot exceed the grand total (₹${totalAmount.toFixed(2)}).`
      });
    }

    if (roundedPaid < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative."
      });
    }

    const outstandingAmount = Math.max(0, Math.round((totalAmount - roundedPaid) * 100) / 100);

    let status = "Paid";
    if (outstandingAmount > 0) {
      status = roundedPaid > 0 ? "Partially Paid" : "Unpaid";
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      customerId,
      items: processedItems,
      subtotal: roundedSubtotal,
      taxTotal: roundedTaxTotal,
      discountTotal: roundedDiscountTotal,
      totalAmount,
      paymentMode,
      status,
      paidAmount: roundedPaid,
      outstandingAmount,
      dueDate,
      businessId,
      createdBy: req.user._id,
    });

    const addedPoints = Math.floor(totalAmount / 100);
    customer.loyaltyPoints += addedPoints;

    if (paymentMode === "Credit" || outstandingAmount > 0) {
      customer.outstandingBalance += outstandingAmount;
    }
    await customer.save();

    const populatedInvoice = await Invoice.findById(invoice._id).populate("customerId");

    return res.status(201).json({ success: true, data: populatedInvoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ businessId: req.user.businessId })
      .populate("customerId")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    }).populate("customerId");

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processReturn = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (invoice.status === "Returned") {
      return res.status(400).json({ success: false, message: "Invoice is already returned" });
    }

    for (const item of invoice.items) {
      const product = await Product.findOne({ _id: item.productId, businessId: req.user.businessId });
      if (product) {
        product.stockQuantity += item.quantity;
        await product.save();
      }
    }

    const customer = await Customer.findOne({ _id: invoice.customerId, businessId: req.user.businessId });
    if (customer) {
      const pointsDeducted = Math.floor(invoice.totalAmount / 100);
      customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - pointsDeducted);

      if (invoice.paymentMode === "Credit" || invoice.outstandingAmount > 0) {
        customer.outstandingBalance = Math.max(0, customer.outstandingBalance - invoice.outstandingAmount);
      }
      await customer.save();
    }

    invoice.status = "Returned";
    await invoice.save();

    return res.status(200).json({ success: true, message: "Invoice returned and inventory restored successfully", data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recordPayment = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const businessId = req.user.businessId;

  try {
    const invoice = await Invoice.findOne({ _id: id, businessId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (invoice.status === "Paid") {
      return res.status(400).json({ success: false, message: "Invoice is already fully paid" });
    }

    if (invoice.status === "Returned") {
      return res.status(400).json({ success: false, message: "Cannot pay returned invoice" });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ success: false, message: "Please enter a valid payment amount" });
    }

    if (payAmount > invoice.outstandingAmount) {
      return res.status(400).json({ success: false, message: `Payment amount (₹${payAmount}) cannot exceed outstanding amount (₹${invoice.outstandingAmount})` });
    }

    invoice.paidAmount += payAmount;
    invoice.outstandingAmount = Math.max(0, invoice.outstandingAmount - payAmount);

    if (invoice.outstandingAmount === 0) {
      invoice.status = "Paid";
    } else {
      invoice.status = "Partially Paid";
    }

    // Update customer outstanding balance
    const customer = await Customer.findOne({ _id: invoice.customerId, businessId });
    if (customer) {
      customer.outstandingBalance = Math.max(0, customer.outstandingBalance - payAmount);
      await customer.save();
    }

    await invoice.save();
    
    const populatedInvoice = await Invoice.findById(invoice._id).populate("customerId");

    return res.status(200).json({ success: true, message: "Payment recorded successfully", data: populatedInvoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
