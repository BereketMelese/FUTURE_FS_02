import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendError } from "../utils/apiResponse.js";
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.header("authorization")?.split(" ")[1];

  if (!token) {
    return sendError(
      res,
      401,
      "AUTH_TOKEN_MISSING",
      "No token, authorization denied",
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    return sendError(res, 401, "AUTH_TOKEN_INVALID", "Token is not valid");
  }
};

export default authMiddleware;
