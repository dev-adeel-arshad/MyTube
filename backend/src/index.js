import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const dbName = process.env.DB_NAME || process.env.MONGODB_DATABASE || null;

// Try common environment variable names (Railway and others)
const dbCandidates = [
  { name: "MONGODB_URI", value: process.env.MONGODB_URI },
  { name: "MONGODB_URL", value: process.env.MONGODB_URL },
  { name: "MONGO_URL", value: process.env.MONGO_URL },
  { name: "MONGO_URI", value: process.env.MONGO_URI },
  { name: "DB_URL", value: process.env.DB_URL },
  { name: "DATABASE_URL", value: process.env.DATABASE_URL },
  { name: "RAILWAY_MONGODB_URI", value: process.env.RAILWAY_MONGODB_URI },
  { name: "MONGODB_CONNECTION_URI", value: process.env.MONGODB_CONNECTION_URI },
].filter((candidate) => candidate.value);

let rawDbUrl = dbCandidates.length ? dbCandidates[0].value : null;
let dbSource = dbCandidates.length ? dbCandidates[0].name : null;
if (!rawDbUrl && process.env.DB_URL && dbName) {
  rawDbUrl = `${process.env.DB_URL.replace(/\/$/, "")}/${dbName}`;
  dbSource = "DB_URL+DB_NAME";
}

const MONGODB_URI = rawDbUrl || `mongodb://127.0.0.1:27017/recovered-app`;

function maskConnectionString(uri) {
  try {
    // Remove credentials for logging
    return uri.replace(/:\/\/.*@/, "://<hidden>@");
  } catch (e) {
    return uri;
  }
}

const startServer = async () => {
  try {
    console.log("Starting backend server with PORT=", PORT);
    console.log("Frontend URL configured:", process.env.FRONTEND_URL || "not set");
    console.log("MongoDB URI source:", dbSource || "default_local");
    console.log("Connecting MongoDB to:", maskConnectionString(MONGODB_URI));
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message || error);
    if (error.message && error.message.includes("ENOTFOUND")) {
      console.error(
        "DNS lookup failed for MongoDB host. Check the connection string and Railway environment variables (e.g. RAILWAY_MONGODB_URI, MONGODB_URI, MONGODB_URL)."
      );
    }
    process.exit(1);
  }
};

startServer();
