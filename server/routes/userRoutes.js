const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
} = require("../controllers/userController");

const router = express.Router();

// View all users
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getUsers
);

// View one user
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getUserById
);

// Activate or deactivate a user
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateUserStatus
);

// Change a user's role
router.patch(
  "/:id/role",
  protect,
  authorizeRoles("admin"),
  updateUserRole
);

module.exports = router;