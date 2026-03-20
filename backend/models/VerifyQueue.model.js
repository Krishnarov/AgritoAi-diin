import mongoose from "mongoose";

const verifyQueueSchema = new mongoose.Schema({
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['waiting', 'in_review', 'completed', 'escalated'],
    default: 'waiting'
  },
  position: { type: Number },
  deadline: { type: Date }, // Default 48h from submission
}, { timestamps: true });

export default mongoose.model("VerifyQueue", verifyQueueSchema);
