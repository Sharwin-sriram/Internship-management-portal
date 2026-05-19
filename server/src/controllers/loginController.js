import express from "express";
import User from "../models/User.js";
import { logAuthEvent, AuthEventType, AuthEventStatus } from "../services/authLog.service.js";

// Helper for sending token response
const sendTokenResponse = async (user, statusCode, res) => {
  const token = await user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 24) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      await logAuthEvent({
        userId: null,
        eventType: AuthEventType.LOGIN_FAILED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { email },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await logAuthEvent({
        userId: user._id,
        eventType: AuthEventType.LOGIN_FAILED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { email },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await logAuthEvent({
      userId: user._id,
      eventType: AuthEventType.LOGIN_SUCCESS,
      status: AuthEventStatus.SUCCESS,
      req,
      metadata: { email },
    });

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    await logAuthEvent({
      userId: null,
      eventType: AuthEventType.LOGIN_FAILED,
      status: AuthEventStatus.FAILED,
      req,
      metadata: { error: error.message },
    });

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Only allow public registration for students and companies
    const validRole = (role === "company" || role === "student") ? role : "student";

    const user = await User.create({
      name,
      email,
      password,
      role: validRole,
    });

    await sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user && req.user._id) {
      await logAuthEvent({
        userId: req.user._id,
        eventType: AuthEventType.LOGOUT,
        status: AuthEventStatus.SUCCESS,
        req,
      });
    }

    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    await logAuthEvent({
      userId: req.user?._id || null,
      eventType: AuthEventType.LOGOUT,
      status: AuthEventStatus.FAILED,
      req,
      metadata: { error: error.message },
    });

    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};
