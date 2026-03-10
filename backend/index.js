import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { swaggerDocs } from "./swagger.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import { createRateLimiter } from "./middleware/rateLimit.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: "Too many auth requests. Please retry shortly.",
});

const leadsRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 180,
  message: "Too many leads requests. Please retry shortly.",
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/leads", leadsRateLimiter, leadRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Mini CRM API" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    swaggerDocs(app, PORT);
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
  });
