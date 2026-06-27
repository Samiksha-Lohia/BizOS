import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"], // e.g., Pcs, Kg, Box
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 5,
    },
    expiryDate: {
      type: Date,
    },
    barcode: {
      type: String,
      trim: true,
    },
    warehouse: {
      type: String,
      default: "Main Store",
      trim: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly search products within a business
productSchema.index({ businessId: 1, name: 1 });
productSchema.index({ businessId: 1, barcode: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
