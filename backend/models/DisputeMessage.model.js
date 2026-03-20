import mongoose from "mongoose";

const disputeMessageSchema = new mongoose.Schema({
  dispute: { type: mongoose.Schema.Types.ObjectId, ref: "DisputeCase", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }], // Photo evidence URLs
  is_admin_note: { type: Boolean, default: false }, // Internal notes
}, { timestamps: true });

export default mongoose.model("DisputeMessage", disputeMessageSchema);
