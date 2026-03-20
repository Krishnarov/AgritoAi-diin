import mongoose from "mongoose";

const earningRecordSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agreement: { type: mongoose.Schema.Types.ObjectId, ref: "RentalAgreement" },
  amount: { type: Number, required: true },
  season: { type: String, required: true }, // e.g. "Rabi 2025"
  payment_mode: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'cheque'],
    required: true
  },
  txn_id: { type: String }, // Transaction ID
  status: {
    type: String,
    enum: ['pending', 'received', 'disputed'],
    default: 'received'
  },
  paid_at: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("EarningRecord", earningRecordSchema);
