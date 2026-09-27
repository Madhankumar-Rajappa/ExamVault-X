const mongoose = require("mongoose");
const dns = require("dns");

if (!process.env.VERCEL) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) {
    // Ignore DNS set errors in restricted environments
  }
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/examvault";

  if (process.env.VERCEL && !primaryUri) {
    const msg = "MONGO_URI environment variable is missing in Vercel settings.";
    console.error("❌ " + msg);
    throw new Error(msg);
  }

  const targetUri = primaryUri || fallbackUri;

  try {
    const db = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState;
    console.log("✔ MongoDB connected successfully.");
  } catch (primaryError) {
    console.warn("⚠️ Primary MongoDB connection error:", primaryError.message);
    
    // Only attempt local fallback when running locally (not on Vercel)
    if (!process.env.VERCEL) {
      try {
        const db = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 3000,
        });
        isConnected = db.connections[0].readyState;
        console.log(`✔ Local MongoDB connected successfully (${fallbackUri}).`);
      } catch (fallbackError) {
        console.error("❌ Both MongoDB Atlas and Local MongoDB connections failed.");
      }
    } else {
      throw primaryError;
    }
  }
};

module.exports = connectDB;