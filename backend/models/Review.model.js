import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  renter:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farmer:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plot:      { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  agreement: { type: mongoose.Schema.Types.ObjectId, ref: "RentalAgreement" },
  rating:    { type: Number, min: 1, max: 5, required: true },
  comment:   { type: String },
  tags: [{ 
    type: String,
    enum: ['good_soil', 'irrigation_worked', 'farmer_cooperative', 'fair_price', 'boundary_correct', 'recommend']
  }],
  is_public: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
