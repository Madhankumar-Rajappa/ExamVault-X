const AuditLog = require("../models/AuditLog");

// Get audit logs with pagination and action filtering
const getAuditLogs = async (req, res) => {
  try {
    const { action, resourceType, page: pageQuery, limit: limitQuery } = req.query;

    const page = Math.max(parseInt(pageQuery, 10) || 1, 1);
    const requestedLimit = parseInt(limitQuery, 10) || 20;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    const [logs, totalRecords] = await Promise.all([
      AuditLog.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      message: "Audit logs fetched successfully.",
      pagination: {
        currentPage: page,
        recordsPerPage: limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      count: logs.length,
      auditLogs: logs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch audit logs.",
    });
  }
};

// Get single audit log by ID
const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate("user", "name email role");

    if (!log) {
      return res.status(404).json({
        message: "Audit log entry not found.",
      });
    }

    return res.status(200).json({
      auditLog: log,
    });
  } catch (error) {
    console.error("Get audit log error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch audit log detail.",
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
};