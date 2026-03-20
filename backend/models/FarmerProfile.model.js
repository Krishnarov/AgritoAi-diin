import mongoose from "mongoose";

const farmerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  aadhaar_number: { type: String, required: true }, // Should be encrypted in production
  pan_number: { type: String },
  profile_photo_url: { type: String },
  address: { type: String, required: true },
  kyc_verified: { type: Boolean, default: false },
  kyc_verified_at: { type: Date },
  kyc_verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("FarmerProfile", farmerProfileSchema);
