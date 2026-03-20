import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  label: { type: String, required: true }, // e.g., "Kolhapur 1ha sugarcane"
  filters: {
    district: { type: String },
    status: { type: String },
    minArea: { type: Number },
    maxArea: { type: Number },
    maxPrice: { type: Number },
    irrigation: { type: Boolean },
    cropType: { type: String },
    radius_km: { type: Number },
    center_coords: [{ type: Number }], // [lng, lat]
  },
  alert_enabled: { type: Boolean, default: true },
  last_run_at: { type: Date, default: Date.now },
  new_results_count: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("SavedSearch", savedSearchSchema);
