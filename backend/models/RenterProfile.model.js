import mongoose from "mongoose";

const renterProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  aadhaar_number: { type: String }, // Should be encrypted in production
  experience_years: { type: Number, default: 0 },
  farming_type: { 
    type: String, 
    enum: ['owner_farmer', 'tenant_farmer', 'agricultural_labourer', 'agri_entrepreneur'],
    required: true,
    default: 'tenant_farmer'
  },
  preferred_districts: [{ type: String }],
  preferred_crops: [{ type: String }],
  min_area_needed: { type: Number },
  max_area_needed: { type: Number },
  max_budget_per_season: { type: Number },
  needs_irrigation: { type: Boolean, default: false },
  about: { type: String },
  is_verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("RenterProfile", renterProfileSchema);
