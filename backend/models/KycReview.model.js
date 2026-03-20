import mongoose from "mongoose";

const kycReviewSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doc_type: {
    type: String,
    enum: ['aadhaar', 'pan', 'voter_id', 'driving_license'],
    required: true
  },
  doc_url: { type: String, required: true },
  
  // Linked metadata for review
  full_name: { type: String },
  dob: { type: String },
  aadhaar_number: { type: String },
  pan_number: { type: String },
  address: { type: String },
  pan_doc_url: { type: String },
  selfie_url: { type: String },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resubmit_requested'],
    default: 'pending'
  },
  reject_reason: { type: String },
  reviewed_at: { type: Date },
}, { timestamps: true });

export default mongoose.model("KycReview", kycReviewSchema);
