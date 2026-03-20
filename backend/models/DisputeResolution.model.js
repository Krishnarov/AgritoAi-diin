import mongoose from "mongoose";

const disputeResolutionSchema = new mongoose.Schema({
  dispute: { type: mongoose.Schema.Types.ObjectId, ref: "DisputeCase", required: true },
  resolved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  outcome: {
    type: String,
    enum: ['farmer_wins', 'renter_wins', 'mutual_settlement', 'no_action', 'referred_to_court'],
    required: true
  },
  summary: { type: String, required: true },
  penalty_applied: { type: String },
  plot_suspended: { type: Boolean, default: false },
  user_banned: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("DisputeResolution", disputeResolutionSchema);
