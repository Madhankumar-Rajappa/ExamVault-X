const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../utils/upload");

const {
  createQuestionPaper,
  getQuestionPapers,
  getQuestionPaperById,
  updateQuestionPaper,
  deleteQuestionPaper,
  submitQuestionPaperForReview,
  approveQuestionPaper,
  rejectQuestionPaper,
  scheduleQuestionPaper,
  releaseQuestionPaper,
  downloadQuestionPaper,
} = require("../controllers/questionPaperController");

const router = express.Router();

// Create question paper
router.post(
  "/",
  protect,
  authorizeRoles("admin", "question_setter"),
  upload.single("questionPaper"),
  createQuestionPaper
);

// Get all question papers
router.get("/", protect, getQuestionPapers);

// Download question paper
router.get(
  "/:id/download",
  protect,
  downloadQuestionPaper
);

// Get one question paper
router.get("/:id", protect, getQuestionPaperById);

// Update draft/rejected question paper
router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "question_setter"),
  upload.single("questionPaper"),
  updateQuestionPaper
);

// Delete question paper (soft delete)
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "question_setter"),
  deleteQuestionPaper
);

// Submit for review
router.patch(
  "/:id/submit-review",
  protect,
  authorizeRoles("admin", "question_setter"),
  submitQuestionPaperForReview
);

// Approve question paper
router.patch(
  "/:id/approve",
  protect,
  authorizeRoles("admin", "reviewer"),
  approveQuestionPaper
);

// Reject question paper
router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("admin", "reviewer"),
  rejectQuestionPaper
);

// Schedule approved question paper
router.patch(
  "/:id/schedule",
  protect,
  authorizeRoles("admin"),
  scheduleQuestionPaper
);

// Release scheduled question paper
router.patch(
  "/:id/release",
  protect,
  authorizeRoles("admin"),
  releaseQuestionPaper
);

module.exports = router;