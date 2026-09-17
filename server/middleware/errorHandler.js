const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  // Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size limit exceeded. Maximum file size allowed is 5 MB.",
      });
    }
    return res.status(400).json({
      message: err.message || "File upload error.",
    });
  }

  // Custom File validation error from multer filter
  if (err.message === "Only PDF files are allowed." || err.message === "Invalid file type. Only PDF files are allowed.") {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ID format: ${err.value}`,
    });
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      message: messages.join(", "),
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      message: `An entry with this ${field} already exists.`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid authentication token.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Authentication token has expired. Please log in again.",
    });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    message: err.message || "Internal server error.",
  });
};

module.exports = errorHandler;
