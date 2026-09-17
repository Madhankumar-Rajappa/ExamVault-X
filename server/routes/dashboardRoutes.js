const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getDashboardSummary,
  getQuestionPaperStatistics,
  getUserStatistics,
} = require("../controllers/dashboardController");

const router = express.Router();

// Summary endpoint accessible to all authenticated users (returns role-tailored stats)
router.get("/summary", protect, getDashboardSummary);

// Detailed admin statistics
router.get(
  "/question-paper-statistics",
  protect,
  authorizeRoles("admin"),
  getQuestionPaperStatistics
);

router.get(
  "/user-statistics",
  protect,
  authorizeRoles("admin"),
  getUserStatistics
);

module.exports = router;
