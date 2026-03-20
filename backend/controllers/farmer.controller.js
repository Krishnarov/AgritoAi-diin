import path from "path";
import Plot from "../models/Plot.model.js";
import FarmerProfile from "../models/FarmerProfile.model.js";
import BankDetail from "../models/BankDetail.model.js";
import EarningRecord from "../models/EarningRecord.model.js";
import KycReview from "../models/KycReview.model.js";

// @desc    Get farmer profile details
// @route   GET /api/farmer/profile
// @access  Private (farmer)
export const getFarmerProfile = async (req, res) => {
  let profile = await FarmerProfile.findOne({ user: req.user._id });
  if (!profile) {
    // Create an empty profile if not exists
    profile = await FarmerProfile.create({
      user: req.user._id,
      aadhaar_number: "000000000000",
      address: "Update your address"
    });
  }
  res.json({ success: true, profile });
};

// @desc    Update farmer profile
// @route   POST /api/farmer/profile
// @access  Private (farmer)
export const updateFarmerProfile = async (req, res) => {
  const profile = await FarmerProfile.findOneAndUpdate(
    { user: req.user._id },
    { ...req.body, kyc_verified: false }, // Reset verification on update if needed
    { new: true, upsert: true }
  );

  // Create or update a pending KYC review so it shows up for Admin
  if (req.body.aadhaar_number) {
    await KycReview.findOneAndUpdate(
      { farmer: req.user._id, status: "pending" },
      {
        farmer: req.user._id,
        doc_type: "aadhaar",
        doc_url: req.body.profile_photo_url || "https://res.cloudinary.com/dmrs7p5as/image/upload/v1710500000/default_doc.png",
        aadhaar_number: req.body.aadhaar_number,
        pan_number: req.body.pan_number,
        address: req.body.address,
        status: "pending"
      },
      { upsert: true, new: true }
    );
  }

  res.json({ success: true, profile });
};

// @desc    Get bank details
// @route   GET /api/farmer/bank
// @access  Private (farmer)
export const getBankDetail = async (req, res) => {
  const bank = await BankDetail.findOne({ farmer: req.user._id });
  res.json({ success: true, bank });
};

// @desc    Update bank details
// @route   POST /api/farmer/bank
// @access  Private (farmer)
export const updateBankDetail = async (req, res) => {
  const bank = await BankDetail.findOneAndUpdate(
    { farmer: req.user._id },
    { ...req.body },
    { new: true, upsert: true }
  );
  res.json({ success: true, bank });
};

// @desc    Get earnings
// @route   GET /api/farmer/earnings
// @access  Private (farmer)
export const getFarmerEarnings = async (req, res) => {
  const earnings = await EarningRecord.find({ farmer: req.user._id }).sort("-paid_at");
  const total = earnings.reduce((acc, e) => acc + e.amount, 0);
  res.json({ success: true, earnings, total });
};

// @desc    Submit KYC request with documents
// @route   POST /api/farmer/kyc/submit
// @access  Private (farmer)
export const submitKycRequest = async (req, res) => {
  const { full_name, dob, doc_type, aadhaar_number, pan_number, address } = req.body;

  if (!full_name || !dob || !doc_type || !aadhaar_number || !address) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  if (!req.files?.aadhaar_doc) {
    return res.status(400).json({ success: false, message: "Aadhaar document is required" });
  }

  const aadhaarDocUrl = `/uploads/kyc/${path.basename(req.files.aadhaar_doc[0].path)}`;
  const panDocUrl = req.files?.pan_doc ? `/uploads/kyc/${path.basename(req.files.pan_doc[0].path)}` : null;
  const selfieUrl = req.files?.selfie ? `/uploads/kyc/${path.basename(req.files.selfie[0].path)}` : null;

  // Cancel any previous pending request
  await KycReview.deleteMany({ farmer: req.user._id, status: "pending" });

  const kyc = await KycReview.create({
    farmer: req.user._id,
    doc_type,
    doc_url: aadhaarDocUrl,
    aadhaar_number,
    pan_number: pan_number || null,
    address,
    full_name,
    dob,
    pan_doc_url: panDocUrl,
    selfie_url: selfieUrl,
    status: "pending",
  });

  // Update farmer profile with latest info
  await FarmerProfile.findOneAndUpdate(
    { user: req.user._id },
    { aadhaar_number, pan_number, address, kyc_verified: false },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: "KYC request submitted successfully", kyc });
};

// @desc    Get current KYC status
// @route   GET /api/farmer/kyc/status
// @access  Private (farmer)
export const getKycStatus = async (req, res) => {
  const kyc = await KycReview.findOne({ farmer: req.user._id }).sort("-createdAt");
  const profile = await FarmerProfile.findOne({ user: req.user._id });
  res.json({ success: true, kyc, kyc_verified: profile?.kyc_verified || false });
};

// @desc    Get farmer dashboard stats (already exists in some form)
// @route   GET /api/farmer/stats
// @access  Private (farmer)
export const getFarmerStats = async (req, res) => {
  const plots = await Plot.find({ farmer: req.user._id });
  const stats = {
    totalPlots: plots.length,
    active: plots.filter(p => p.status === "available" || p.status === "booked").length,
    pending: plots.filter(p => p.status === "pending").length,
    rejected: plots.filter(p => p.status === "rejected").length,
    totalArea: plots.reduce((acc, p) => acc + (p.area_ha || 0), 0).toFixed(2),
  };
  res.json({ success: true, stats });
};
