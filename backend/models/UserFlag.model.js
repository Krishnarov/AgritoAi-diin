import mongoose from "mongoose";

const userFlagSchema = new mongoose.Schema({
  flagged_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  flagged_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: {
    type: String,
    enum: ['fake_documents', 'fraud_attempt', 'duplicate_account', 'spam', 'abusive_behavior', 'land_dispute'],
    required: true
  },
  description: { type: String },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'dismissed'],
    default: 'open'
  },
  resolved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolution_note: { type: String },
  resolved_at: { type: Date },
}, { timestamps: true });

export default mongoose.model("UserFlag", userFlagSchema);
