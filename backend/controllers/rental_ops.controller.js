import PaymentRecord from "../models/PaymentRecord.model.js";
import ActiveRental from "../models/ActiveRental.model.js";
import Review from "../models/Review.model.js";
import RentalAgreement from "../models/RentalAgreement.model.js";

// --- Payments ---
export const recordPayment = async (req, res) => {
  try {
    const { farmer, agreement, amount, season, payment_mode, upi_ref, txn_id } = req.body;
    const payment = await PaymentRecord.create({
      renter: req.user._id,
      farmer,
      agreement,
      amount,
      season,
      payment_mode,
      upi_ref,
      txn_id,
      status: 'paid',
      paid_at: Date.now()
    });
    res.json({ success: true, payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const list = await PaymentRecord.find({ renter: req.user._id }).populate("farmer plot");
    res.json({ success: true, payments: list });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// --- Active Monitoring ---
export const startTracking = async (req, res) => {
  try {
    const { plot, agreement, current_crop, season_start, season_end } = req.body;
    const tracking = await ActiveRental.create({
      renter: req.user._id,
      plot,
      agreement,
      current_crop,
      season_start,
      season_end,
      crop_status: 'sowing'
    });
    res.json({ success: true, tracking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateCropStatus = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { crop_status, notes } = req.body;
    const tracking = await ActiveRental.findByIdAndUpdate(
      rentalId,
      { crop_status, notes },
      { new: true }
    );
    res.json({ success: true, tracking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getActiveRentals = async (req, res) => {
  try {
    const list = await ActiveRental.find({ renter: req.user._id }).populate("plot agreement");
    res.json({ success: true, rentals: list });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// --- Reviews ---
export const postReview = async (req, res) => {
  try {
    const { farmer, plot, agreement, rating, comment, tags } = req.body;
    const review = await Review.create({
      renter: req.user._id,
      farmer,
      plot,
      agreement,
      rating,
      comment,
      tags
    });
    res.json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ renter: req.user._id }).populate("farmer plot");
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
