import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import plotRoutes from "./routes/plot.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import renterRoutes from "./routes/renter.routes.js";
import farmerRoutes from "./routes/farmer.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import disputeRoutes from "./routes/dispute.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true, methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plots", plotRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/renter", renterRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/disputes", disputeRoutes);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "AgritoAI API running ✅" }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌾 AgritoAI server running on port ${PORT}`));