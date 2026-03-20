import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, unique: true, lowercase: true },
    phone:   { type: String, required: true },
    password:{ type: String, required: true, minlength: 6, select: false },
    role:    { type: String, enum: ["farmer", "renter", "admin"], default: "farmer" },
    state:   { type: String },
    district:{ type: String },
    isVerified: { type: Boolean, default: false },
    avatar:  { type: String },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);