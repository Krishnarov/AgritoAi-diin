import express from "express";
import { 
  getDashboardStats, getMyRentals, 
  getProfile, updateProfile, getCropPreferences, addCropPreference,
  listDocuments, uploadDocument, toggleSavedPlot, getSavedPlots,
  logView, getViewHistory, getSavedSearches, saveSearch
} from "../controllers/renter.controller.js";
import { 
  raiseInterest, startNegotiation, submitOffer, finalizeAgreement, getMyInterests
} from "../controllers/negotiation.controller.js";
import { 
  recordPayment, getPaymentHistory, startTracking, updateCropStatus, getActiveRentals,
  postReview, getReviews
} from "../controllers/rental_ops.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/my-rentals", protect, getMyRentals);

// Profile & Preferences
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.get("/crop-preferences", protect, getCropPreferences);
router.post("/crop-preferences", protect, addCropPreference);

// Documents
router.get("/documents", protect, listDocuments);
router.post("/documents", protect, uploadDocument);

// Discovery & Saved
router.post("/saved/:plotId", protect, toggleSavedPlot);
router.get("/saved", protect, getSavedPlots);
router.get("/searches", protect, getSavedSearches);
router.post("/searches", protect, saveSearch);
router.post("/view/:plotId", protect, logView);
router.get("/view-history", protect, getViewHistory);

// Interactions & Negotiation
router.post("/interest", protect, raiseInterest);
router.get("/interests", protect, getMyInterests);
router.post("/negotiations/start", protect, startNegotiation);
router.post("/negotiations/offer", protect, submitOffer);
router.post("/negotiations/finalize", protect, finalizeAgreement);

// Payments & Active Rentals
router.post("/payments", protect, recordPayment);
router.get("/payments", protect, getPaymentHistory);
router.post("/rentals/track", protect, startTracking);
router.patch("/rentals/track/:rentalId", protect, updateCropStatus);
router.get("/rentals/active", protect, getActiveRentals);

// Reviews
router.post("/reviews", protect, postReview);
router.get("/reviews", protect, getReviews);

export default router;
