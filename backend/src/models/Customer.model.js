import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Customer phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: ["Retail"],
    },
    outstandingBalance: {
      type: Number,
      default: 0, // Positive means they owe the business money (credit sales)
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
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

customerSchema.index({ businessId: 1, phone: 1 });
customerSchema.index({ businessId: 1, name: 1 });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
