import mongoose from "mongoose";

const landDocumentSchema = new mongoose.Schema({
  plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doc_type: {
    type: String,
    enum: ['khasara', '7_12_utara', 'satbara', 'mutation', 'fard', 'aadhar', 'pan'],
    required: true
  },
  file_url: { type: String, required: true }, // Cloudinary URL
  public_id: { type: String }, // For Cloudinary asset management
  original_name: { type: String },
  is_verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("LandDocument", landDocumentSchema);
