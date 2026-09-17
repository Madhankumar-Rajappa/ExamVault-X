const User = require("../models/User");
const createAuditLog = require("../utils/auditLogger");

// Get all users with filters and pagination
const getUsers = async (req, res) => {
  try {
    const { role, search, page: pageQuery, limit: limitQuery } = req.query;

    const page = Math.max(parseInt(pageQuery, 10) || 1, 1);
    const requestedLimit = parseInt(limitQuery, 10) || 20;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [users, totalRecords] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      message: "Users fetched successfully.",
      pagination: {
        currentPage: page,
        recordsPerPage: limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch users.",
    });
  }
};

// Get one user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch user.",
    });
  }
};

// Activate or deactivate a user
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own account status.",
      });
    }

    user.isActive = isActive;
    await user.save();

    await createAuditLog({
      userId: req.user.id,
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      resourceType: "User",
      resourceId: user._id,
      req,
      details: `User status changed to ${isActive}.`,
    });

    return res.status(200).json({
      message: "User status updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error.message);

    return res.status(500).json({
      message: "Unable to update user status.",
    });
  }
};

// Change user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = [
      "admin",
      "question_setter",
      "reviewer",
      "student",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    user.role = role;
    await user.save();

    await createAuditLog({
      userId: req.user.id,
      action: "USER_ROLE_UPDATED",
      resourceType: "User",
      resourceId: user._id,
      req,
      details: `User role changed to ${role}.`,
    });

    return res.status(200).json({
      message: "User role updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error.message);

    return res.status(500).json({
      message: "Unable to update user role.",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
};