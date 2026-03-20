import mongoose from "mongoose";

const negotiationSchema = new mongoose.Schema({
  interest: { type: mongoose.Schema.Types.ObjectId, ref: "RenterInterest", required: true },
  plot:     { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  renter:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farmer:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  offers: [{
    by:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount:  { type: Number, required: true },
    message: { type: String },
    created_at: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['ongoing', 'agreed', 'breakdown', 'expired'],
    default: 'ongoing'
  },
  final_agreed_price: { type: Number },
  agreed_at: { type: Date },
}, { timestamps: true });

export default mongoose.model("Negotiation", negotiationSchema);
