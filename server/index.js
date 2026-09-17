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

// Allow frontend requests
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/question-papers", questionPaperRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "ExamVault-X backend is running",
    status: "success",
  });
});

// Health-check route
app.get("/api/health", (req, res) => {
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

// Start the server
const startServer = async () => {
  await connectDB();
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();