import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["Free", "Basic", "Pro", "Enterprise"],
        default: "Free",
      },
      status: {
        type: String,
        enum: ["Trial", "Active", "Expired"],
        default: "Trial",
      },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

const Business = mongoose.model("Business", businessSchema);
export default Business;
