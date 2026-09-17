const mongoose = require("mongoose");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore DNS set errors in restricted serverless containers
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/examvault";

  if (!primaryUri && !fallbackUri) {
    console.error("❌ MONGO_URI environment variable is not defined.");
    return;
  }

  try {
    const db = await mongoose.connect(primaryUri || fallbackUri, {
      serverSelectionTimeoutMS: 15000,
    });
    isConnected = db.connections[0].readyState;
    console.log("✔ MongoDB Atlas connected successfully.");
  } catch (primaryError) {
    console.warn("⚠️ MongoDB Atlas connection error:", primaryError.message);
    
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
    }
  }
};

module.exports = connectDB;