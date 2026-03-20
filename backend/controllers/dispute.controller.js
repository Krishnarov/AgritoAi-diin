import DisputeCase from "../models/DisputeCase.model.js";
import DisputeMessage from "../models/DisputeMessage.model.js";
import DisputeResolution from "../models/DisputeResolution.model.js";

// @desc    Get all disputes
// @route   GET /api/disputes
// @access  Private (admin/farmer/renter)
export const getAllDisputes = async (req, res) => {
  const query = req.user.role === "admin" 
    ? {} 
    : { $or: [{ raised_by: req.user._id }, { against_user: req.user._id }] };

  const disputes = await DisputeCase.find(query)
    .sort("-createdAt")
    .populate("raised_by", "name role")
    .populate("against_user", "name role")
    .populate("plot", "gataNo village district")
    .lean();

  res.json({ success: true, count: disputes.length, disputes });
};

// @desc    Get dispute details & messages
// @route   GET /api/disputes/:id
// @access  Private
export const getDisputeById = async (req, res) => {
  const dispute = await DisputeCase.findById(req.params.id)
    .populate("raised_by", "name email phone")
    .populate("against_user", "name email phone")
    .populate("plot", "gataNo area_ha village district")
    .populate("agreement")
    .lean();

  if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

  const messages = await DisputeMessage.find({ dispute: req.params.id })
    .sort("createdAt")
    .populate("sender", "name role")
    .lean();

  res.json({ success: true, dispute, messages });
};

// @desc    Raise a dispute
// @route   POST /api/disputes
// @access  Private
export const raiseDispute = async (req, res) => {
  const dispute = await DisputeCase.create({
    ...req.body,
    raised_by: req.user._id
  });
  res.status(201).json({ success: true, dispute });
};

// @desc    Admin resolve dispute
// @route   POST /api/disputes/:id/resolve
// @access  Private (admin)
export const resolveDispute = async (req, res) => {
  const { outcome, summary, penalty_applied, plot_suspended, user_banned } = req.body;
  const dispute = await DisputeCase.findById(req.params.id);
  if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

  const resolution = await DisputeResolution.create({
    dispute: req.params.id,
    resolved_by: req.user._id,
    outcome,
    summary,
    penalty_applied,
    plot_suspended,
    user_banned
  });

  dispute.status = "resolved";
  dispute.resolved_at = new Date();
  await dispute.save();

  res.json({ success: true, resolution });
};
