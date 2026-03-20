import mongoose from "mongoose";

const savedPlotSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  personal_note: { type: String },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
}, { timestamps: true });

export default mongoose.model("SavedPlot", savedPlotSchema);
