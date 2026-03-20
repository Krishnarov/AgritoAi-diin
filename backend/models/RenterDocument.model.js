import mongoose from "mongoose";

const renterDocumentSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doc_type: { 
    type: String, 
    enum: ['aadhaar', 'pan', 'farmer_certificate', 'soil_health_card', 'kisan_credit_card'],
    required: true
  },
  file_url: { type: String, required: true },
  public_id: { type: String }, // Cloudinary asset ID
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  is_verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("RenterDocument", renterDocumentSchema);
