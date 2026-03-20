import Plot from "../models/Plot.model.js";
import User from "../models/User.model.js";
import FarmerProfile from "../models/FarmerProfile.model.js";
import KycReview from "../models/KycReview.model.js";

// @desc    Get all pending plots for admin review
// @route   GET /api/admin/plots/pending
// @access  Private (admin)
export const getPendingPlots = async (req, res) => {
  const plots = await Plot.find({ status: "pending" })
    .sort("-createdAt")
    .populate("farmer", "name email phone district state createdAt")
    .lean();
  res.json({ success: true, count: plots.length, plots });
};

// @desc    Get single plot with full farmer intel for admin
// @route   GET /api/admin/plots/:id
// @access  Private (admin)
export const getPlotForVerification = async (req, res) => {
  const plot = await Plot.findById(req.params.id)
    .populate("farmer", "name email phone state district createdAt isVerified")
    .lean();
  if (!plot) return res.status(404).json({ success: false, message: "Plot not found" });

  const farmerId = plot.farmer._id;

  // Farmer's past plots
  const pastPlots = await Plot.find({ farmer: farmerId, _id: { $ne: plot._id } })
    .select("status").lean();
  const approvedCount = pastPlots.filter(p => p.status === "available" || p.status === "booked").length;
  const rejectedCount = pastPlots.filter(p => p.status === "rejected").length;

  // KYC status
  const kyc = await KycReview.findOne({ farmer: farmerId }).sort("-createdAt").lean();
  const farmerProfile = await FarmerProfile.findOne({ user: farmerId }).lean();

  // Account age in months
  const accountAgeMonths = Math.floor(
    (Date.now() - new Date(plot.farmer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // Overlap check
  let hasOverlap = false;
  try {
    const overlapping = await Plot.findOne({
      _id: { $ne: plot._id },
      status: { $in: ["available", "booked", "pending"] },
      geometry: { $geoIntersects: { $geometry: plot.geometry } },
    }).lean();
    hasOverlap = !!overlapping;
  } catch {}

  // Auto verification score
  const kycDone     = farmerProfile?.kyc_verified || kyc?.status === "approved";
  const areaOk      = !plot.area_mismatch;
  const noOverlap   = !hasOverlap;
  let score = 0;
  if (areaOk)    score += 30;
  if (noOverlap) score += 20;
  if (kycDone)   score += 10;
  // Gata number filled = +40
  if (plot.gata_number || plot.gataNo) score += 40;

  // Trust score
  let trustScore = 50;
  if (kycDone)           trustScore += 20;
  if (accountAgeMonths >= 3) trustScore += 10;
  if (approvedCount > 0) trustScore += 10;
  if (rejectedCount > 0) trustScore -= 15;
  trustScore = Math.max(0, Math.min(100, trustScore));

  res.json({
    success: true,
    plot,
    farmerIntel: {
      accountAgeMonths,
      approvedCount,
      rejectedCount,
      kycStatus: farmerProfile?.kyc_verified ? "verified" : (kyc?.status || "not_submitted"),
      kycDocType: kyc?.doc_type || null,
      trustScore,
    },
    verification: {
      hasOverlap,
      areaOk,
      kycDone,
      score,
    },
  });
};

// @desc    Admin approves or rejects a plot
// @route   PATCH /api/admin/plots/:id/verify
// @access  Private (admin)
export const verifyPlot = async (req, res) => {
  const { action, reason } = req.body;  // action: "approve" | "reject"

  if (!["approve", "reject"].includes(action))
    return res.status(400).json({ success: false, message: "action must be approve or reject" });

  const plot = await Plot.findById(req.params.id);
  if (!plot) return res.status(404).json({ success: false, message: "Plot not found" });
  if (plot.status !== "pending")
    return res.status(400).json({ success: false, message: "Plot is not in pending state" });

  plot.status       = action === "approve" ? "available" : "rejected";
  plot.verifiedBy   = req.user._id;
  plot.verifiedAt   = new Date();
  if (action === "reject") {
    if (!reason) return res.status(400).json({ success: false, message: "Rejection reason required" });
    plot.rejectionReason = reason;
  }

  await plot.save();
  res.json({ success: true, plot });
};

// @desc    Admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
export const getDashboardStats = async (req, res) => {
  const [totalUsers, totalPlots, statusCounts] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    Plot.countDocuments(),
    Plot.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
  ]);

  const stats = { totalUsers, totalPlots, pending: 0, available: 0, booked: 0, rejected: 0 };
  statusCounts.forEach(({ _id, count }) => { stats[_id] = count; });

  res.json({ success: true, stats });
};

// @desc    Get all plots (admin full view)
// @route   GET /api/admin/plots
// @access  Private (admin)
export const getAllPlots = async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  const query = status ? { status } : { status: { $in: ["available", "booked"] } };

  const plots = await Plot.find(query)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("farmer", "name email phone")
    .lean();

  const total = await Plot.countDocuments(query);
  res.json({ success: true, total, page: parseInt(page), plots });
};