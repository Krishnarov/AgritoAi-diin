import mongoose from "mongoose";

const bankDetailSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  account_number: { type: String, required: true }, // Should be encrypted in production
  ifsc_code: { type: String, required: true },
  bank_name: { type: String, required: true },
  branch: { type: String, required: true },
  upi_id: { type: String }, // e.g. ramesh@upi
  is_verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("BankDetail", bankDetailSchema);
