import express from "express";
import {
  getPendingPlots, getPlotForVerification,
  verifyPlot, getDashboardStats, getAllPlots,
} from "../controllers/admin.controller.js";
import { 
  flagUser, reviewKyc, getPendingKyc, reviewRenterDoc 
} from "../controllers/admin_user.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes protected
router.use(protect, adminOnly);

router.get("/stats",               getDashboardStats);
router.get("/plots",               getAllPlots);
router.get("/plots/pending",       getPendingPlots);
router.get("/plots/:id",           getPlotForVerification);
router.patch("/plots/:id/verify",  verifyPlot);

// KYC & Flagging
router.get("/kyc/pending",         getPendingKyc);
router.patch("/kyc/:id/review",    reviewKyc);
router.patch("/renter-kyc/:id/review", reviewRenterDoc);

router.post("/users/:id/flag",     flagUser);

export default router;