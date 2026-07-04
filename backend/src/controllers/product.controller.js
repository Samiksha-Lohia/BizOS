import Product from "../models/Product.model.js";

export const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      businessId: req.user.businessId,
      createdBy: req.user._id,
    };
    const product = await Product.create(productData);
    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProducts = async (req, res) => {
  const { search, category, barcode, lowStock } = req.query;
  const query = { businessId: req.user.businessId };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (category) {
    query.category = category;
  }
  if (barcode) {
    query.barcode = barcode;
  }

  try {
    let products = await Product.find(query);

    if (lowStock === "true") {
      products = products.filter(p => p.stockQuantity <= p.minStockLevel);
    }

    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adjustStock = async (req, res) => {
  const { quantity, type } = req.body;

  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const qty = Number(quantity);
    if (type === "in") {
      product.stockQuantity += qty;
    } else if (type === "out") {
      if (product.stockQuantity < qty) {
        return res.status(400).json({ success: false, message: "Insufficient stock quantity" });
      }
      product.stockQuantity -= qty;
    } else if (type === "set") {
      if (qty < 0) {
        return res.status(400).json({ success: false, message: "Stock quantity cannot be negative" });
      }
      product.stockQuantity = qty;
    } else {
      return res.status(400).json({ success: false, message: "Invalid type. Must be 'in', 'out' or 'set'" });
    }

    await product.save();
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
