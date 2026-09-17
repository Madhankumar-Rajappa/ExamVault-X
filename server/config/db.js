const mongoose = require("mongoose");
const dns = require("dns");

// Use public DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore DNS set errors if restricted by system environment
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/examvault";

  try {
    // Try primary URI (Atlas)
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("✔ MongoDB Atlas connected successfully.");
  } catch (primaryError) {
    console.warn("⚠️ MongoDB Atlas connection unavailable (IP Whitelist / Network restriction):", primaryError.message);
    console.log("🔄 Falling back to local MongoDB connection...");

    try {
      await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✔ Local MongoDB connected successfully (${fallbackUri}).`);
    } catch (fallbackError) {
      console.error("❌ Both MongoDB Atlas and Local MongoDB connections failed.");
      console.error("Local Error:", fallbackError.message);
    }
  }
};

module.exports = connectDB;