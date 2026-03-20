import mongoose from "mongoose";

const viewHistorySchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  view_count: { type: Number, default: 1 },
  first_viewed_at: { type: Date, default: Date.now },
  last_viewed_at: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure unique entry per renter/plot combo
viewHistorySchema.index({ renter: 1, plot: 1 }, { unique: true });

export default mongoose.model("ViewHistory", viewHistorySchema);
