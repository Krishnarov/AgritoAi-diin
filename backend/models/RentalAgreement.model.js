import mongoose from "mongoose";

const rentalAgreementSchema = new mongoose.Schema({
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  total_amount: { type: Number, required: true },
  amount_per_season: { type: Number, required: true },
  crop_to_grow: [{ type: String }], // e.g. ["Rice", "Wheat"]
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'terminated', 'disputed'],
    default: 'draft'
  },
  terms: { type: String }, // Custom contract terms
  signed_at: { type: Date },
}, { timestamps: true });

export default mongoose.model("RentalAgreement", rentalAgreementSchema);
