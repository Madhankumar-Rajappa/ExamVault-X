require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const seedInitialData = require("./utils/seed");

const authRoutes = require("./routes/authRoutes");
const questionPaperRoutes = require("./routes/questionPaperRoutes");
const auditRoutes = require("./routes/auditRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Enable CORS for all origins (Localhost, Vercel preview domains & production)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

// Database connection middleware for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error("DB Middleware warning:", e.message);
  }
  next();
});

// API routes (supports both /api prefix and direct serverless route rewrites)
app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/question-papers", "/question-papers"], questionPaperRoutes);
app.use(["/api/audit-logs", "/audit-logs"], auditRoutes);
app.use(["/api/users", "/users"], userRoutes);
app.use(["/api/dashboard", "/dashboard"], dashboardRoutes);

// Home route
app.get(["/", "/api"], (req, res) => {
  res.json({
    message: "ExamVault-X backend is running",
    status: "success",
  });
});

// Health-check route
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    service: "ExamVault-X API",
    status: "healthy",
  });
});

const errorHandler = require("./middleware/errorHandler");

// Handle unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Initialize DB Connection and Seed Data
connectDB().then(() => {
  seedInitialData();
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;