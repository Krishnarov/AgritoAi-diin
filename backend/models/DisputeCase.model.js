import mongoose from "mongoose";

const disputeCaseSchema = new mongoose.Schema({
  raised_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  against_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  agreement: { type: mongoose.Schema.Types.ObjectId, ref: "RentalAgreement" },
  type: {
    type: String,
    enum: ['fake_boundary', 'payment_fraud', 'land_encroachment', 'crop_damage', 'agreement_breach', 'identity_fraud', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'awaiting_evidence', 'resolved', 'escalated', 'closed'],
    default: 'open'
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  resolved_at: { type: Date },
}, { timestamps: true });

export default mongoose.model("DisputeCase", disputeCaseSchema);
