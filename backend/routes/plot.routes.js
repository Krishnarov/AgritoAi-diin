import express from "express";
import {
  submitPlot, getMapPlots, getMyPlots,
  getPlotById, sendRentalRequest, handleRentalRequest, getFarmerStats,
} from "../controllers/plot.controller.js";
import { protect, farmerOnly } from "../middleware/auth.middleware.js";
import { uploadKhasara } from "../utils/multer.js";

const router = express.Router();

router.get("/map",  getMapPlots);                              // Public — map view
router.get("/my",   protect, farmerOnly, getMyPlots);         // Farmer's plots
router.get("/farmer/stats", protect, farmerOnly, getFarmerStats); // Farmer's stats
router.get("/:id",  getPlotById);                             // Single plot

router.post("/",    protect, farmerOnly, uploadKhasara, submitPlot);  // Submit new plot

router.post("/:id/request",                   protect, sendRentalRequest);            // Renter requests
router.patch("/:id/request/:requestId",        protect, farmerOnly, handleRentalRequest); // Farmer handles request

export default router;