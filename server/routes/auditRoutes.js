const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAuditLogs, getAuditLogById } = require("../controllers/auditController");

const router = express.Router();

// Only administrators can view audit logs
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAuditLogs
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getAuditLogById
);

module.exports = router;