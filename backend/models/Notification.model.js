import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      'plot_verified', 
      'plot_rejected', 
      'new_interest', 
      'agreement_signed', 
      'payment_received', 
      'otp', 
      'dispute'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  ref_id: { type: mongoose.Schema.Types.ObjectId }, // plot_id, agreement_id, etc.
  ref_model: {
    type: String,
    enum: ['Plot', 'RentalAgreement', 'RenterInterest', 'EarningRecord']
  },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
