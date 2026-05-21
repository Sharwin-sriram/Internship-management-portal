import crypto from "crypto";
import User from "../models/user.js";
import emailService from "../services/emailService.js";
import env from "../config/env.js";

/**
 * Student requests a verification email (magic link).
 * @route POST /api/auth/verify-email/request
 */
export const requestEmailVerification = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can verify a student email address.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Your email is already verified.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

    const sent = await emailService.sendStudentEmailVerification({
      to: user.email,
      name: user.name,
      verificationUrl,
    });

    if (!sent.success) {
      return res.status(503).json({
        success: false,
        message:
          sent.message ||
          "Email could not be sent. If this persists, contact support.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent. Check your inbox.",
    });
  } catch (error) {
    console.error("requestEmailVerification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending verification email.",
    });
  }
};

/**
 * Confirm email from link in verification email.
 * @route GET /api/auth/verify-email?token=
 */
export const confirmEmailVerification = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Verification token is missing.",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("confirmEmailVerification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying email.",
    });
  }
};
