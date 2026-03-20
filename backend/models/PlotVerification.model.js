import mongoose from "mongoose";

const plotVerificationSchema = new mongoose.Schema({
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: {
    type: String,
    enum: ['approved', 'rejected', 'query_raised'],
    required: true
  },
  gata_match: { type: Boolean, default: false },
  area_match: { type: Boolean, default: false }, // e.g. ±10% tolerance
  overlap_clear: { type: Boolean, default: false },
  score: { type: Number, min: 0, max: 100 },
  reject_reason: { type: String },
  admin_notes: { type: String },
  verified_at: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("PlotVerification", plotVerificationSchema);
