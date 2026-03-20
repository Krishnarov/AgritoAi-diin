import Plot from "../models/Plot.model.js";
import RenterProfile from "../models/RenterProfile.model.js";
import RenterDocument from "../models/RenterDocument.model.js";
import SavedPlot from "../models/SavedPlot.model.js";
import ViewHistory from "../models/ViewHistory.model.js";
import CropPreference from "../models/CropPreference.model.js";
import SavedSearch from "../models/SavedSearch.model.js";
import ActiveRental from "../models/ActiveRental.model.js"; // Added import for ActiveRental
import Negotiation from "../models/Negotiation.model.js"; // Added import for Negotiation

// @desc    Get renter dashboard stats
// @route   GET /api/renter/dashboard-stats
// @access  Private (renter)
export const getDashboardStats = async (req, res) => {
  const [activeRentals, preferences, interests, saved] = await Promise.all([
    ActiveRental.find({ renter: req.user._id }).populate("plot"),
    CropPreference.find({ renter: req.user._id }),
    Negotiation.find({ renter: req.user._id, status: 'pending' }),
    SavedPlot.find({ renter: req.user._id })
  ]);

  const stats = {
    activeBookings: activeRentals.length,
    totalArea: activeRentals.reduce((acc, p) => acc + (p.plot?.area_ha || 0), 0).toFixed(2),
    pendingRequests: interests.length,
    totalSpent: activeRentals.reduce((acc, p) => acc + (p.plot?.pricePerSeason || 0), 0)
  };

  res.json({
    success: true,
    stats,
    recentBookings: activeRentals.slice(0, 5).map(r => r.plot).filter(p => !!p)
  });
};

// @desc    Get renter's rentals and requests
// @route   GET /api/renter/my-rentals
// @access  Private (renter)
export const getMyRentals = async (req, res) => {
  const renterId = req.user._id;

  const rentals = await Plot.find({ currentRenter: renterId, status: "booked" })
    .populate("farmer", "name phone email")
    .lean();

  // Find all plots where the renter HAS a request
  const allPlotsWithMyRequests = await Plot.find({
    "rentalRequests.renter": renterId
  }).lean();

  // Extract the specific requests
  const requests = allPlotsWithMyRequests.map(plot => {
    const myReq = plot.rentalRequests.find(r => r.renter.toString() === renterId.toString());
    return {
      ...plot,
      myRequest: myReq
    };
  }).filter(p => p.myRequest.status === "pending");

  res.json({
    success: true,
    rentals,
    requests
  });
};

// --- Profile & Preferences ---
export const getProfile = async (req, res) => {
  try {
    let profile = await RenterProfile.findOne({ user: req.user._id });
    if (!profile) profile = await RenterProfile.create({ user: req.user._id });
    res.json({ success: true, profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await RenterProfile.findOneAndUpdate({ user: req.user._id }, req.body, { new: true, upsert: true });
    res.json({ success: true, profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getCropPreferences = async (req, res) => {
  try {
    const prefs = await CropPreference.find({ renter: req.user._id });
    res.json({ success: true, preferences: prefs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const addCropPreference = async (req, res) => {
  try {
    const pref = await CropPreference.create({ ...req.body, renter: req.user._id });
    res.json({ success: true, preference: pref });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// --- Documents ---
export const listDocuments = async (req, res) => {
  try {
    const docs = await RenterDocument.find({ renter: req.user._id });
    res.json({ success: true, docs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const uploadDocument = async (req, res) => {
  try {
    const doc = await RenterDocument.create({ ...req.body, renter: req.user._id });
    res.json({ success: true, doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// --- Discovery ---
export const toggleSavedPlot = async (req, res) => {
  try {
    const { plotId } = req.params;
    const existing = await SavedPlot.findOne({ renter: req.user._id, plot: plotId });
    if (existing) {
      await SavedPlot.findByIdAndDelete(existing._id);
      return res.json({ success: true, saved: false });
    }
    await SavedPlot.create({ renter: req.user._id, plot: plotId });
    res.json({ success: true, saved: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getSavedPlots = async (req, res) => {
  try {
    const saved = await SavedPlot.find({ renter: req.user._id }).populate("plot");
    res.json({ success: true, saved });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const logView = async (req, res) => {
  try {
    const { plotId } = req.params;
    await ViewHistory.findOneAndUpdate(
      { renter: req.user._id, plot: plotId },
      { $inc: { view_count: 1 }, last_viewed_at: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getViewHistory = async (req, res) => {
  try {
    const history = await ViewHistory.find({ renter: req.user._id }).populate("plot").sort({ last_viewed_at: -1 });
    res.json({ success: true, history });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ renter: req.user._id });
    res.json({ success: true, searches });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const saveSearch = async (req, res) => {
  try {
    const search = await SavedSearch.create({ ...req.body, renter: req.user._id });
    res.json({ success: true, search });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
