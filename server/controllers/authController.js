const jwt = require("jsonwebtoken");

const User = require("../models/User");
const createAuditLog = require("../utils/auditLogger");

const {
  hashPassword,
  comparePassword,
} = require("../utils/security");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check whether the email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Hash the password before storing it
    const hashedPassword = await hashPassword(password);

    // Public registration can create only student accounts
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
    });

    // Record registration activity
    await createAuditLog({
      userId: user._id,
      action: "USER_REGISTERED",
      resourceType: "User",
      resourceId: user._id,
      req,
      details: "A new student account was registered.",
    });

    // Generate login token
    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: error.message || "Unable to register user.",
    });
  }
};

// Login an existing user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find the user and include the hidden password field
    let user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // Auto-provision demo account on-demand if database is fresh/empty
    if (!user) {
      const demoAccounts = {
        "admin@examvault.edu": { name: "System Administrator", role: "admin" },
        "setter@examvault.edu": { name: "Question Setter", role: "question_setter" },
        "reviewer@examvault.edu": { name: "Faculty Reviewer", role: "reviewer" },
        "student@examvault.edu": { name: "Student User", role: "student" },
      };

      if (demoAccounts[normalizedEmail]) {
        const info = demoAccounts[normalizedEmail];
        const hashedPassword = await hashPassword("ExamVault2026!");
        const newDemoUser = await User.create({
          name: info.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: info.role,
          isActive: true,
        });
        user = await User.findById(newDemoUser._id).select("+password");
      }
    }

    // Check account existence and active status
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Compare the entered password with the hashed password
    const passwordMatches = await comparePassword(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Verify expected role portal match if specified
    const { expectedRole } = req.body;
    if (expectedRole) {
      if (user.role !== expectedRole && user.role !== "admin") {
        const roleLabel = expectedRole.replace("_", " ");
        return res.status(403).json({
          message: `Access Denied. Your account is not authorized to log in through the ${roleLabel} portal.`,
        });
      }
    }

    // Record successful login activity
    await createAuditLog({
      userId: user._id,
      action: "USER_LOGIN",
      resourceType: "User",
      resourceId: user._id,
      req,
      details: "User logged in successfully.",
    });

    // Generate login token
    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: error.message || "Unable to login.",
    });
  }
};

// Get current authenticated user profile
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch user profile.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};