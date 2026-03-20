import mongoose from "mongoose";

const plotSchema = new mongoose.Schema(
  {
    farmer:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Land details
    gataNo:          { type: String, trim: true },   // legacy
    gata_number:     { type: String, trim: true },
    survey_number:   { type: String },
    khata_number:    { type: String },
    khatauni_number: { type: String },
    area_ha:         { type: Number, required: true },
    area_ha_claimed: { type: Number },
    area_mismatch:   { type: Boolean, default: false },
    village:  { type: String },
    tehsil:   { type: String },
    district: { type: String },
    state:    { type: String },
    description: { type: String },

    // Land characteristics
    land_type:       { type: String, enum: ["agricultural", "horticultural", "fallow", "forest", "wasteland", ""] },
    ownership_type:  { type: String, enum: ["private", "joint", "government", "patta", ""] },
    soil_type:       { type: String, enum: ["black_cotton", "red_laterite", "alluvial", "sandy_loam", "clay", "loamy", ""] },
    irrigation:      { type: String, enum: ["canal", "borewell", "drip", "sprinkler", "rainfed", "well", ""] },
    last_crop_grown:    { type: String },
    crop_types_allowed: { type: String },
    crops_not_allowed:  { type: String },

    // GeoJSON Polygon
    geometry: {
      type:        { type: String, enum: ["Polygon"], required: true },
      coordinates: { type: [[[Number]]], required: true },
    },

    // Khasara/Khatauni document (path or S3 URL)
    khasaraDoc: { type: String },

    // Status lifecycle: pending → available → booked / rejected
    status: {
      type: String,
      enum: ["pending", "available", "booked", "rejected"],
      default: "pending",
      index: true,
    },

    // Admin verification
    verifiedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt:      { type: Date },
    rejectionReason: { type: String },

    // Extended rental info
    pricePerSeason:       { type: Number },
    price_per_season:     { type: Number },
    price_per_year:       { type: Number },
    advance_amount:       { type: Number },
    price_negotiable:     { type: Boolean, default: true },
    available_from:       { type: Date, default: Date.now },
    minimum_lease_months: { type: Number, default: 3 },
    
    // Performance & Analytics
    views_count:          { type: Number, default: 0 },
    last_rented_at:       { type: Date },
    total_earnings:       { type: Number, default: 0 },

    currentRenter:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rentedFrom:      { type: Date },
    rentedUntil:     { type: Date },

    // Rental requests list (Legacy, RenterInterest model will handle new ones)
    rentalRequests: [
      {
        renter:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message:     { type: String },
        status:      { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// 2dsphere index — enables geo queries like $geoWithin, $near
plotSchema.index({ geometry: "2dsphere" });
plotSchema.index({ status: 1, district: 1 });

export default mongoose.model("Plot", plotSchema);