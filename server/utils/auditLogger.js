const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  userId,
  action,
  resourceType,
  resourceId = null,
  req = null,
  details = "",
}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      resourceType,
      resourceId,
      ipAddress: req?.ip || null,
      userAgent: req?.headers?.["user-agent"] || null,
      details,
    });
  } catch (error) {
    // Logging failure should not crash the main application
    console.error("Audit log error:", error.message);
  }
};

module.exports = createAuditLog;