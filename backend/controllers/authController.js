import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { sendError, sendValidationError } from "../utils/apiResponse.js";

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors);
  }

  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({
      email,
      username,
    });

    if (user) {
      return sendError(res, 400, "USER_ALREADY_EXISTS", "User already exists");
    }

    user = new User({
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch {
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors);
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return sendError(res, 400, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendError(res, 400, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

const checkUserExists = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors);
  }

  try {
    const { email, username } = req.body;

    const query = {};
    if (email) {
      query.email = email;
    }
    if (username) {
      query.username = username;
    }

    const user = await User.exists(query);

    return res.json({
      success: true,
      exists: Boolean(user),
    });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found");
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error.message);
    return sendError(res, 500, "SERVER_ERROR", "Server error");
  }
};

export { register, login, checkUserExists, getCurrentUser };
