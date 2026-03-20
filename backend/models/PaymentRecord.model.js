import mongoose from "mongoose";

const paymentRecordSchema = new mongoose.Schema({
  renter:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farmer:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agreement: { type: mongoose.Schema.Types.ObjectId, ref: "RentalAgreement", required: true },
  amount:    { type: Number, required: true },
  season:    { type: String }, // e.g., "Rabi 2025-26"
  payment_mode: { 
    type: String, 
    enum: ['upi', 'bank_transfer', 'cash', 'cheque'],
    required: true
  },
  upi_ref:      { type: String },
  txn_id:       { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded', 'disputed'],
    default: 'paid'
  },
  paid_at: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("PaymentRecord", paymentRecordSchema);
