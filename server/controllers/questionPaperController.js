const QuestionPaper = require("../models/QuestionPaper");
const createAuditLog = require("../utils/auditLogger");

const path = require("path");
const fs = require("fs");

// Create a new question paper
const createQuestionPaper = async (req, res) => {
  try {
    const {
      title,
      subject,
      examName,
      examDate,
      description,
    } = req.body;

    const fileName = req.file?.originalname;
    const filePath = req.file?.path;

    if (
      !title ||
      !subject ||
      !examName ||
      !examDate ||
      !fileName ||
      !filePath
    ) {
      return res.status(400).json({
        message: "All required question-paper fields must be provided.",
      });
    }

    const parsedExamDate = new Date(examDate);

    if (Number.isNaN(parsedExamDate.getTime())) {
      return res.status(400).json({
        message: "Invalid exam date.",
      });
    }

    const questionPaper = await QuestionPaper.create({
      title: title.trim(),
      subject: subject.trim(),
      examName: examName.trim(),
      examDate: parsedExamDate,
      description: description?.trim() || "",
      fileName,
      filePath,
      uploadedBy: req.user.id,
      status: "draft",
    });

    await createAuditLog({
      userId: req.user.id,
      action: "QUESTION_PAPER_CREATED",
      resourceType: "QuestionPaper",
      resourceId: questionPaper._id,
      req,
      details: `Question paper "${questionPaper.title}" was created.`,
    });

    return res.status(201).json({
      message: "Question paper created successfully.",
      questionPaper,
    });
  } catch (error) {
    console.error("Create question paper error:", error.message);

    return res.status(500).json({
      message: "Unable to create question paper.",
    });
  }
};

// Get question papers with filters and pagination
const getQuestionPapers = async (req, res) => {
  try {
    // Auto-release scheduled papers whose release date has arrived
    await QuestionPaper.updateMany(
      {
        status: "scheduled",
        releaseDate: { $lte: new Date() },
        isDeleted: false,
      },
      { $set: { status: "released" } }
    );

    const {
      subject,
      examName,
      title,
      search,
      status,
      page: pageQuery,
      limit: limitQuery,
    } = req.query;

    const page = Math.max(parseInt(pageQuery, 10) || 1, 1);
    const requestedLimit = parseInt(limitQuery, 10) || 10;
    const limit = Math.min(Math.max(requestedLimit, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
    };

    // Role-specific view rules
    if (req.user.role === "student") {
      filter.status = "released";
    } else if (req.user.role === "question_setter") {
      // Question setters can filter by status, or see their own uploaded papers if status not specified
      if (status) {
        filter.status = status;
      }
    } else if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { examName: searchRegex },
      ];
    }

    if (subject) {
      filter.subject = { $regex: subject, $options: "i" };
    }

    if (examName) {
      filter.examName = { $regex: examName, $options: "i" };
    }

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const [questionPapers, totalRecords] = await Promise.all([
      QuestionPaper.find(filter)
        .populate("uploadedBy", "name email role")
        .populate("reviewedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      QuestionPaper.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      message: "Question papers fetched successfully.",
      pagination: {
        currentPage: page,
        recordsPerPage: limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      count: questionPapers.length,
      questionPapers,
    });
  } catch (error) {
    console.error("Get question papers error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch question papers.",
    });
  }
};

// Get one question paper by ID
const getQuestionPaperById = async (req, res) => {
  try {
    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("uploadedBy", "name email role")
      .populate("reviewedBy", "name email role");

    if (!paper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    // Students can access only released papers
    if (req.user.role === "student" && paper.status !== "released") {
      return res.status(403).json({
        message: "Students can access only released question papers.",
      });
    }

    return res.status(200).json({
      questionPaper: paper,
    });
  } catch (error) {
    console.error("Get question paper error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch question paper.",
    });
  }
};

// Submit a question paper for review
const submitQuestionPaperForReview = async (req, res) => {
  try {
    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!paper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    if (paper.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can submit only your own question papers.",
      });
    }

    if (paper.status !== "draft") {
      return res.status(400).json({
        message: "Only draft papers can be submitted for review.",
      });
    }

    paper.status = "under_review";
    await paper.save();

    await createAuditLog({
      userId: req.user.id,
      action: "QUESTION_PAPER_SUBMITTED_FOR_REVIEW",
      resourceType: "QuestionPaper",
      resourceId: paper._id,
      req,
      details: `Question paper "${paper.title}" submitted for review.`,
    });

    return res.status(200).json({
      message: "Question paper submitted for review.",
      questionPaper: paper,
    });
  } catch (error) {
    console.error("Submit for review error:", error.message);

    return res.status(500).json({
      message: "Unable to submit question paper for review.",
    });
  }
};

// Approve a question paper
const approveQuestionPaper = async (req, res) => {
  try {
    const { reviewComment } = req.body;

    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!paper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    if (paper.status !== "under_review") {
      return res.status(400).json({
        message: "Only papers under review can be approved.",
      });
    }

    paper.status = "approved";
    paper.reviewedBy = req.user.id || req.user._id;
    if (reviewComment !== undefined) {
      paper.reviewComment = reviewComment.trim();
    }

    await paper.save();

    await createAuditLog({
      userId: req.user.id || req.user._id,
      action: "QUESTION_PAPER_APPROVED",
      resourceType: "QuestionPaper",
      resourceId: paper._id,
      req,
      details: `Question paper "${paper.title}" was approved.`,
    });

    return res.status(200).json({
      message: "Question paper approved successfully.",
      questionPaper: paper,
    });
  } catch (error) {
    console.error("Approve question paper error:", error.message);

    return res.status(500).json({
      message: "Unable to approve question paper.",
    });
  }
};

// Reject a question paper
const rejectQuestionPaper = async (req, res) => {
  try {
    const { reviewComment } = req.body;

    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!paper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    if (paper.status !== "under_review") {
      return res.status(400).json({
        message: "Only papers under review can be rejected.",
      });
    }

    paper.status = "rejected";
    paper.reviewedBy = req.user.id || req.user._id;
    if (reviewComment !== undefined) {
      paper.reviewComment = reviewComment.trim();
    }

    await paper.save();

    await createAuditLog({
      userId: req.user.id || req.user._id,
      action: "QUESTION_PAPER_REJECTED",
      resourceType: "QuestionPaper",
      resourceId: paper._id,
      req,
      details: `Question paper "${paper.title}" was rejected. ${reviewComment ? `Reason: ${reviewComment}` : ""}`,
    });

    return res.status(200).json({
      message: "Question paper rejected successfully.",
      questionPaper: paper,
    });
  } catch (error) {
    console.error("Reject question paper error:", error.message);

    return res.status(500).json({
      message: "Unable to reject question paper.",
    });
  }
};

// Schedule an approved question paper
const scheduleQuestionPaper = async (req, res) => {
  try {
    const { releaseDate } = req.body;

    if (!releaseDate) {
      return res.status(400).json({
        message: "Release date is required.",
      });
    }

    const parsedReleaseDate = new Date(releaseDate);

    if (Number.isNaN(parsedReleaseDate.getTime())) {
      return res.status(400).json({
        message: "Invalid release date.",
      });
    }

    if (parsedReleaseDate <= new Date()) {
      return res.status(400).json({
        message: "Release date must be in the future.",
      });
    }

    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!paper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    if (paper.status !== "approved") {
      return res.status(400).json({
        message: "Only approved papers can be scheduled.",
      });
    }

    paper.releaseDate = parsedReleaseDate;
    paper.status = "scheduled";

    await paper.save();

    await createAuditLog({
      userId: req.user.id,
      action: "QUESTION_PAPER_SCHEDULED",
      resourceType: "QuestionPaper",
      resourceId: paper._id,
      req,
      details: `Question paper scheduled for ${parsedReleaseDate.toISOString()}.`,
    });

    return res.status(200).json({
      message: "Question paper scheduled successfully.",
      questionPaper: paper,
    });
  } catch (error) {
    console.error("Schedule question paper error:", error.message);

    return res.status(500).json({
      message: "Unable to schedule question paper.",
    });
  }
};

// Release a scheduled question paper
const releaseQuestionPaper = async (req, res) => {
  try {
    const paper = await QuestionPaper.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!paper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    if (paper.status !== "scheduled") {
      return res.status(400).json({
        message: "Only scheduled papers can be released.",
      });
    }

    if (paper.releaseDate && paper.releaseDate > new Date()) {
      return res.status(400).json({
        message: "The scheduled release time has not arrived.",
      });
    }

    paper.status = "released";

    await paper.save();

    await createAuditLog({
      userId: req.user.id,
      action: "QUESTION_PAPER_RELEASED",
      resourceType: "QuestionPaper",
      resourceId: paper._id,
      req,
      details: `Question paper "${paper.title}" was released.`,
    });

    return res.status(200).json({
      message: "Question paper released successfully.",
      questionPaper: paper,
    });
  } catch (error) {
    console.error("Release question paper error:", error.message);

    return res.status(500).json({
      message: "Unable to release question paper.",
    });
  }
};

// Download a question paper securely
const downloadQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;

    const questionPaper = await QuestionPaper.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!questionPaper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    // Students can download only released papers
    if (
      req.user.role === "student" &&
      questionPaper.status !== "released"
    ) {
      return res.status(403).json({
        message: "You cannot download this question paper.",
      });
    }

    const filePath = path.resolve(questionPaper.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Question paper file not found on the server.",
      });
    }

    await createAuditLog({
      userId: req.user.id,
      action: "QUESTION_PAPER_DOWNLOADED",
      resourceType: "QuestionPaper",
      resourceId: questionPaper._id,
      req,
      details: `Downloaded question paper: ${questionPaper.title}`,
    });

    return res.download(
      filePath,
      questionPaper.fileName,
      (error) => {
        if (error) {
          console.error("File download error:", error.message);

          if (!res.headersSent) {
            res.status(500).json({
              message: "Failed to download question paper.",
            });
          }
        }
      }
    );
  } catch (error) {
    console.error("Download question paper error:", error.message);

    return res.status(500).json({
      message: "Failed to download question paper.",
    });
  }
};

// Update draft question paper details (or re-edit rejected paper)
const updateQuestionPaper = async (req, res) => {
  try {
    const { title, subject, examName, examDate, description } = req.body;
    const paperId = req.params.id;

    const paper = await QuestionPaper.findOne({
      _id: paperId,
      isDeleted: false,
    });

    if (!paper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    const userId = req.user.id || req.user._id;

    // Only uploader or admin can edit
    if (paper.uploadedBy.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You do not have permission to edit this question paper.",
      });
    }

    // Only draft or rejected papers can be edited
    if (paper.status !== "draft" && paper.status !== "rejected") {
      return res.status(400).json({
        message: "Only draft or rejected question papers can be edited.",
      });
    }

    if (title) paper.title = title.trim();
    if (subject) paper.subject = subject.trim();
    if (examName) paper.examName = examName.trim();
    if (description !== undefined) paper.description = description.trim();

    if (examDate) {
      const parsedExamDate = new Date(examDate);
      if (!Number.isNaN(parsedExamDate.getTime())) {
        paper.examDate = parsedExamDate;
      }
    }

    // If new file uploaded
    if (req.file) {
      paper.fileName = req.file.originalname;
      paper.filePath = req.file.path;
    }

    // If it was rejected and edited, reset status to draft
    if (paper.status === "rejected") {
      paper.status = "draft";
    }

    await paper.save();

    await createAuditLog({
      userId,
      action: "QUESTION_PAPER_UPDATED",
      resourceType: "QuestionPaper",
      resourceId: paper._id,
      req,
      details: `Question paper "${paper.title}" was updated.`,
    });

    return res.status(200).json({
      message: "Question paper updated successfully.",
      questionPaper: paper,
    });
  } catch (error) {
    console.error("Update question paper error:", error.message);
    return res.status(500).json({
      message: "Unable to update question paper.",
    });
  }
};

// Soft delete a question paper
const deleteQuestionPaper = async (req, res) => {
  try {
    const paperId = req.params.id;

    const paper = await QuestionPaper.findOne({
      _id: paperId,
      isDeleted: false,
    });

    if (!paper) {
      return res.status(404).json({
        message: "Question paper not found.",
      });
    }

    const userId = req.user.id || req.user._id;

    if (paper.uploadedBy.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You do not have permission to delete this question paper.",
      });
    }

    paper.isDeleted = true;
    await paper.save();

    await createAuditLog({
      userId,
      action: "QUESTION_PAPER_DELETED",
      resourceType: "QuestionPaper",
      resourceId: paper._id,
      req,
      details: `Question paper "${paper.title}" was soft deleted.`,
    });

    return res.status(200).json({
      message: "Question paper deleted successfully.",
    });
  } catch (error) {
    console.error("Delete question paper error:", error.message);
    return res.status(500).json({
      message: "Unable to delete question paper.",
    });
  }
};

module.exports = {
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
};