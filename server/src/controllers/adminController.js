import Admin from "../models/Admin.js";
import User from "../models/user.js";
import { logAuthEvent, AuthEventType, AuthEventStatus } from "../services/authLog.service.js";
import { ensureSampleAdmin } from "../services/sampleSeedService.js";
import { SAMPLE_ADMIN } from "../data/sampleCredentials.js";

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

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: Boolean(user.emailVerified),
    },
  });
};

/** Ensure a User exists for JWT / RBAC and link it on the Admin record */
async function ensureLinkedUser(admin, plainPassword) {
  if (admin.user) {
    const existing = await User.findById(admin.user);
    if (existing) {
      existing.name = admin.name;
      existing.role = "admin";
      existing.isActive = true;
      await existing.save();
      return existing;
    }
  }

  let user = await User.findOne({ email: admin.email });

  if (user) {
    user.name = admin.name;
    user.role = "admin";
    user.isActive = true;
    user.emailVerified = true;
    await user.save();
  } else {
    user = await User.create({
      name: admin.name,
      email: admin.email,
      password: plainPassword,
      role: "admin",
      isActive: true,
      emailVerified: true,
    });
  }

  admin.user = user._id;
  await admin.save();
  return user;
}

// @desc    Admin portal login
// @route   POST /api/admin/login
// @access  Public (private URL only)
export const loginAdmin = async (req, res) => {
  try {
    const email = req.body.email?.trim()?.toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let admin = await Admin.findOne({ email }).select("+password");
    let authenticatedUser = null;

    if (admin) {
      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: "Admin account is disabled",
        });
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      authenticatedUser = await ensureLinkedUser(admin, password);
    } else {
      // Fallback: User with admin role (legacy / bootstrap-only records)
      const user = await User.findOne({ email, role: "admin" }).select("+password");
      if (!user || user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      authenticatedUser = user;

      admin = await Admin.findOne({ email }).select("+password");
      if (!admin) {
        admin = await Admin.create({
          name: user.name,
          email,
          password,
          user: user._id,
          isActive: true,
        });
      } else {
        admin.user = user._id;
        admin.isActive = true;
        await admin.save();
      }
    }

    const user = authenticatedUser;

    admin.lastLoginAt = new Date();
    await admin.save();

    try {
      await logAuthEvent({
        userId: user._id,
        eventType: AuthEventType.LOGIN_SUCCESS,
        status: AuthEventStatus.SUCCESS,
        req,
        metadata: { email, portal: "admin" },
      });
    } catch {
      /* auth log is optional */
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("[admin] login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during admin login",
    });
  }
};

// @desc    Create/reset demo admin (development only)
// @route   POST /api/admin/seed-demo
export const seedDemoAdmin = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  try {
    await ensureSampleAdmin();
    res.status(200).json({
      success: true,
      message: "Demo admin account is ready",
      email: SAMPLE_ADMIN.email,
      password: SAMPLE_ADMIN.password,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to seed demo admin",
    });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Admin
export const getAdminMe = async (req, res) => {
  try {
    const admin = await Admin.findOne({ user: req.user._id }).select("-password");

    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        adminId: admin?._id,
        lastLoginAt: admin?.lastLoginAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching admin profile",
    });
  }
};
