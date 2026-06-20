import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const baseDbUrl = process.env.DB_URL
  ? process.env.DB_URL.replace(/\/$/, "")
  : null;
const dbName = process.env.DB_NAME || null;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  (baseDbUrl && dbName ? `${baseDbUrl}/${dbName}` : null) ||
  "mongodb://127.0.0.1:27017/recovered-app";

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} (env=${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
