import mongoose from "mongoose";
import dotenv from "dotenv";

import { swaggerDocs } from "./swagger.js";
import { createApp } from "./app.js";

dotenv.config();

const app = createApp();

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
