import express from "express";
import { 
  getAllDisputes, 
  getDisputeById, 
  raiseDispute, 
  resolveDispute 
} from "../controllers/dispute.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/",       getAllDisputes);
router.get("/:id",    getDisputeById);
router.post("/",      raiseDispute);

// Admin-specific (could use adminOnly middleware if needed)
router.post("/:id/resolve", resolveDispute);

export default router;
