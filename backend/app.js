import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import { createRateLimiter } from "./middleware/rateLimit.js";

export const createApp = ({ disableRateLimit = false } = {}) => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const authRateLimiter = disableRateLimit
    ? (req, res, next) => next()
    : createRateLimiter({
        windowMs: 60 * 1000,
        max: 40,
        message: "Too many auth requests. Please retry shortly.",
      });

  const leadsRateLimiter = disableRateLimit
    ? (req, res, next) => next()
    : createRateLimiter({
        windowMs: 60 * 1000,
        max: 180,
        message: "Too many leads requests. Please retry shortly.",
      });

  app.use("/api/auth", authRateLimiter, authRoutes);
  app.use("/api/leads", leadsRateLimiter, leadRoutes);

  app.get("/", (req, res) => {
    res.json({ message: "Welcome to Mini CRM API" });
  });

  return app;
};
