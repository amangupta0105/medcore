require("dotenv").config();
const ACCESS_KEY = process.env.ACCESS_KEY;

const jwt = require("jsonwebtoken");
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "Token required",
    });
  }
  try {
    const token = authHeader.split(" ")[1];
    const verifyToken = jwt.verify(token, ACCESS_KEY);
    req.user = verifyToken;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }
    return res.status(500).json({
      message: "Error in auth middleware",
      error: error,
    });
  }
};

module.exports = { authMiddleware };
