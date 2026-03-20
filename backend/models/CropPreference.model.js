import mongoose from "mongoose";

const cropPreferenceSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  crop_name: { type: String, required: true },
  season: { 
    type: String, 
    enum: ['kharif', 'rabi', 'zaid', 'annual'],
    required: true
  },
  area_required_ha: { type: Number },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model("CropPreference", cropPreferenceSchema);
