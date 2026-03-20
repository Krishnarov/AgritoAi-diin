import mongoose from "mongoose";

const renterInterestSchema = new mongoose.Schema({
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String }, // User introduction message
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  responded_at: { type: Date },
}, { timestamps: true });

export default mongoose.model("RenterInterest", renterInterestSchema);
