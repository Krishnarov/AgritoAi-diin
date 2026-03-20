import express from "express";
import { 
  getFarmerProfile, 
  updateFarmerProfile, 
  getBankDetail, 
  updateBankDetail, 
  getFarmerEarnings,
  getFarmerStats,
  submitKycRequest,
  getKycStatus
} from "../controllers/farmer.controller.js";
import { protect, farmerOnly } from "../middleware/auth.middleware.js";
import { uploadKycDocs } from "../utils/multer.js";

const router = express.Router();

router.use(protect, farmerOnly);

router.get("/profile",  getFarmerProfile);
router.post("/profile", updateFarmerProfile);

router.get("/bank",     getBankDetail);
router.post("/bank",    updateBankDetail);

router.get("/earnings", getFarmerEarnings);
router.get("/stats",    getFarmerStats);

router.post("/kyc/submit", uploadKycDocs, submitKycRequest);
router.get("/kyc/status",  getKycStatus);

export default router;
