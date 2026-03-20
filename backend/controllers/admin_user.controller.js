import UserFlag from "../models/UserFlag.model.js";
import KycReview from "../models/KycReview.model.js";
import User from "../models/User.model.js";
import FarmerProfile from "../models/FarmerProfile.model.js";
import RenterProfile from "../models/RenterProfile.model.js";
import RenterDocument from "../models/RenterDocument.model.js";

// @desc    Flag a user for suspicious activity
// @route   POST /api/admin/users/:id/flag
// @access  Private (admin)
export const flagUser = async (req, res) => {
  const { reason, description } = req.body;
  const flag = await UserFlag.create({
    flagged_user: req.params.id,
    flagged_by: req.user._id,
    reason,
    description
  });
  res.json({ success: true, flag });
};

// @desc    Review KYC document
// @route   PATCH /api/admin/kyc/:id/review
// @access  Private (admin)
export const reviewKyc = async (req, res) => {
  const { status, reject_reason } = req.body;
  const review = await KycReview.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  review.status = status;
  review.reviewed_by = req.user._id;
  review.reviewed_at = new Date();
  if (status === 'rejected') review.reject_reason = reject_reason;
  await review.save();

  // If approved, update FarmerProfile
  if (status === 'approved') {
    await FarmerProfile.findOneAndUpdate(
      { user: review.farmer },
      { kyc_verified: true, kyc_verified_at: new Date(), kyc_verified_by: req.user._id }
    );
  }

  res.json({ success: true, review });
};

export const reviewRenterDoc = async (req, res) => {
  const { status, reject_reason } = req.body;
  const doc = await RenterDocument.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

  doc.status = status;
  doc.reject_reason = reject_reason;
  if (status === 'approved') doc.is_verified = true;
  await doc.save();

  if (status === 'approved') {
    await RenterProfile.findOneAndUpdate({ user: doc.renter }, { is_verified: true });
  }

  res.json({ success: true, doc });
};

// @desc    Get pending KYC reviews
// @route   GET /api/admin/kyc/pending
// @access  Private (admin)
export const getPendingKyc = async (req, res) => {
  try {
    const [farmerKyc, renterDocs] = await Promise.all([
      KycReview.find({ status: 'pending' }).populate("farmer", "name email phone"),
      RenterDocument.find({ status: 'pending' }).populate("renter", "name email phone")
    ]);

    // Combine into a unified queue
    const queue = [
      ...farmerKyc.map(k => ({ ...k.toObject(), type: 'farmer', user: k.farmer })),
      ...renterDocs.map(d => ({ ...d.toObject(), type: 'renter', user: d.renter, doc_url: d.file_url }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`[Admin] KYC Queue Fetched. Count: ${queue.length}`);
    res.json({ success: true, count: queue.length, reviews: queue });
  } catch (error) {
    console.error(`[Admin] Error fetching KYC: ${error.message}`);
    res.status(500).json({ success: false, message: "Error fetching KYC queue" });
  }
};
