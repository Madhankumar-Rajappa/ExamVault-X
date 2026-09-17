const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Secure upload directory path supporting serverless & cloud environments
const getUploadDir = () => {
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const targetDir = isServerless
    ? path.join(os.tmpdir(), "uploads")
    : path.join(__dirname, "..", "uploads");

  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (e) {
      console.warn("Upload dir creation note:", e.message);
    }
  }
  return targetDir;
};

const uploadDirectory = getUploadDir();

// Store uploaded files with generated names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

// Allow only PDF files
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf") {
    return cb(new Error("Only PDF files are allowed."));
  }

  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Invalid file type. Only PDF files are allowed."));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;