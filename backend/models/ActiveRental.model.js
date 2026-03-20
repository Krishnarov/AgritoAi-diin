import mongoose from "mongoose";

const activeRentalSchema = new mongoose.Schema({
  renter:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plot:         { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  agreement:    { type: mongoose.Schema.Types.ObjectId, ref: "RentalAgreement", required: true },
  season_start: { type: Date },
  season_end:   { type: Date },
  current_crop: { type: String },
  crop_status: { 
    type: String, 
    enum: ['sowing', 'growing', 'harvesting', 'completed', 'failed'],
    default: 'growing'
  },
  notes:        { type: String },
}, { timestamps: true });

export default mongoose.model("ActiveRental", activeRentalSchema);
