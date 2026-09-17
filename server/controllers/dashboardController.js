const User = require("../models/User");
const QuestionPaper = require("../models/QuestionPaper");
const AuditLog = require("../models/AuditLog");

// GET /api/dashboard/summary
const getDashboardSummary = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id || req.user._id;

    if (role === "admin") {
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        userRoleCounts,
        paperCounts,
        recentAudits,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        QuestionPaper.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        AuditLog.find()
          .populate("user", "name email role")
          .sort({ createdAt: -1 })
          .limit(10),
      ]);

      const papersByStatus = {
        draft: 0,
        under_review: 0,
        approved: 0,
        scheduled: 0,
        released: 0,
        rejected: 0,
        total: 0,
      };

      paperCounts.forEach((item) => {
        if (papersByStatus[item._id] !== undefined) {
          papersByStatus[item._id] = item.count;
        }
        papersByStatus.total += item.count;
      });

      const rolesSummary = {};
      userRoleCounts.forEach((r) => {
        rolesSummary[r._id] = r.count;
      });

      return res.status(200).json({
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          byRole: rolesSummary,
        },
        questionPapers: papersByStatus,
        recentAudits,
      });
    }

    if (role === "question_setter") {
      const [paperCounts, recentPapers] = await Promise.all([
        QuestionPaper.aggregate([
          { $match: { uploadedBy: userId, isDeleted: false } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        QuestionPaper.find({ uploadedBy: userId, isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      const myStats = {
        draft: 0,
        under_review: 0,
        approved: 0,
        scheduled: 0,
        released: 0,
        rejected: 0,
        total: 0,
      };

      paperCounts.forEach((item) => {
        if (myStats[item._id] !== undefined) {
          myStats[item._id] = item.count;
        }
        myStats.total += item.count;
      });

      return res.status(200).json({
        stats: myStats,
        recentPapers,
      });
    }

    if (role === "reviewer") {
      const [awaitingReviewCount, approvedByMe, rejectedByMe, recentReviews] = await Promise.all([
        QuestionPaper.countDocuments({ status: "under_review", isDeleted: false }),
        QuestionPaper.countDocuments({ reviewedBy: userId, status: "approved", isDeleted: false }),
        QuestionPaper.countDocuments({ reviewedBy: userId, status: "rejected", isDeleted: false }),
        QuestionPaper.find({ reviewedBy: userId, isDeleted: false })
          .sort({ updatedAt: -1 })
          .limit(5),
      ]);

      return res.status(200).json({
        stats: {
          awaitingReview: awaitingReviewCount,
          approvedByMe,
          rejectedByMe,
        },
        recentReviews,
      });
    }

    if (role === "student") {
      const [releasedCount, papersBySubject, recentlyReleased] = await Promise.all([
        QuestionPaper.countDocuments({ status: "released", isDeleted: false }),
        QuestionPaper.aggregate([
          { $match: { status: "released", isDeleted: false } },
          { $group: { _id: "$subject", count: { $sum: 1 } } },
        ]),
        QuestionPaper.find({ status: "released", isDeleted: false })
          .sort({ releaseDate: -1, createdAt: -1 })
          .limit(6),
      ]);

      return res.status(200).json({
        totalReleased: releasedCount,
        papersBySubject,
        recentlyReleased,
      });
    }
  } catch (error) {
    console.error("Dashboard summary error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch dashboard summary.",
    });
  }
};

// GET /api/dashboard/question-paper-statistics
const getQuestionPaperStatistics = async (req, res) => {
  try {
    const [statusCounts, subjectCounts] = await Promise.all([
      QuestionPaper.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      QuestionPaper.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$subject", count: { $sum: 1 } } },
      ]),
    ]);

    return res.status(200).json({
      byStatus: statusCounts,
      bySubject: subjectCounts,
    });
  } catch (error) {
    console.error("Question paper statistics error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch question paper statistics.",
    });
  }
};

// GET /api/dashboard/user-statistics
const getUserStatistics = async (req, res) => {
  try {
    const [roleCounts, statusCounts] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: "$isActive", count: { $sum: 1 } } }]),
    ]);

    return res.status(200).json({
      byRole: roleCounts,
      byStatus: statusCounts,
    });
  } catch (error) {
    console.error("User statistics error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch user statistics.",
    });
  }
};

module.exports = {
  getDashboardSummary,
  getQuestionPaperStatistics,
  getUserStatistics,
};
