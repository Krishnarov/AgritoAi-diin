// Run once: node scripts/seedAdmin.js
// Creates admin + demo farmer + demo renter accounts

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model.js";

const envPath = path.resolve(process.cwd(), ".env");
const fallbackEnvPath = path.resolve(process.cwd(), ".env.example");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(fallbackEnvPath)) {
  console.warn("⚠️ .env not found; falling back to .env.example");
  dotenv.config({ path: fallbackEnvPath });
} else {
  console.error("❌ Missing .env or .env.example; please create a .env file with MONGO_URI set.");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("❌ Missing MONGO_URI environment variable.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const users = [
  { name: "Admin",        email: "admin@agritoak.com",  phone: "9000000001", password: "admin123",  role: "admin",  state: "Maharashtra", district: "Pune" },
  { name: "Ramesh Patil", email: "farmer@test.com",     phone: "9000000002", password: "farmer123", role: "farmer", state: "Maharashtra", district: "Sangli" },
  { name: "Suresh Kumar", email: "renter@test.com",     phone: "9000000003", password: "renter123", role: "renter", state: "Maharashtra", district: "Kolhapur" },
];

for (const u of users) {
  const exists = await User.findOne({ email: u.email });
  if (!exists) {
    await User.create(u);
    console.log(`✅ Created: ${u.role} — ${u.email}`);
  } else {
    console.log(`⏭️  Already exists: ${u.email}`);
  }
}

console.log("\n🌾 Seed complete!");
console.log("Admin:  admin@agritoak.com / admin123");
console.log("Farmer: farmer@test.com / farmer123");
console.log("Renter: renter@test.com / renter123");
process.exit(0);