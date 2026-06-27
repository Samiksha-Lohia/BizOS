import Business from "../models/Business.model.js";
import User from "../models/User.model.js";

export const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business profile not found" });
    }
    return res.status(200).json({ success: true, data: business });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createBusiness = async (req, res) => {
  const { name, address, gstin, logo, phone, email } = req.body;

  try {
    if (req.user.businessId) {
      return res.status(400).json({ success: false, message: "User is already associated with a business" });
    }

    const business = await Business.create({
      name,
      address,
      gstin,
      logo,
      phone,
      email,
      owner: req.user._id,
    });

    req.user.businessId = business._id;
    await req.user.save();

    return res.status(201).json({ success: true, data: business });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!business) {
      return res.status(404).json({ success: false, message: "Business profile not found" });
    }
    return res.status(200).json({ success: true, data: business });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
