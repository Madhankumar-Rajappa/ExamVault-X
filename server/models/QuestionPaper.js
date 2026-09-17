const mongoose = require("mongoose");

const questionPaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    examName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    examDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "under_review",
        "approved",
        "scheduled",
        "released",
        "rejected",
      ],
      default: "draft",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewComment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    releaseDate: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
questionPaperSchema.index({ status: 1 });
questionPaperSchema.index({ subject: 1 });
questionPaperSchema.index({ examName: 1 });
questionPaperSchema.index({ uploadedBy: 1 });
questionPaperSchema.index({ isDeleted: 1 });
questionPaperSchema.index({ releaseDate: 1 });

module.exports = mongoose.model("QuestionPaper", questionPaperSchema);