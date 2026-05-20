import { findOrCreateOAuthUser } from "../services/oauthUser.service.js";
import {
  logAuthEvent,
  AuthEventType,
  AuthEventStatus,
} from "../services/authLog.service.js";

function verifyNextAuthSecret(req) {
  const auth = req.headers.authorization;
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return false;
  }
  if (!auth || !auth.startsWith("Bearer ")) {
    return false;
  }
  const token = auth.slice(7);
  return token === secret;
}

/**
 * Server-to-server: called from Next.js after Google OAuth (NextAuth).
 * Protected by Authorization: Bearer <NEXTAUTH_SECRET> (same value on API + Next).
 */
export async function nextauthGoogleSync(req, res) {
  try {
    if (!verifyNextAuthSecret(req)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { googleId, email, name, avatar, role } = req.body || {};

    if (!googleId || typeof googleId !== "string") {
      return res.status(400).json({
        success: false,
        message: "googleId is required",
      });
    }
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    const safeRole = role === "company" ? "company" : "student";
    const image =
      typeof avatar === "string" && avatar.length > 0 ? avatar : "";

    const { user, isNewUser } = await findOrCreateOAuthUser({
      provider: "google",
      providerId: googleId,
      email,
      name,
      avatar: image,
      role: safeRole,
    });

    try {
      await logAuthEvent({
        userId: user._id,
        eventType: AuthEventType.LOGIN_SUCCESS,
        status: AuthEventStatus.SUCCESS,
        req,
        metadata: {
          provider: "google",
          isNewUser,
          method: "nextauth",
        },
      });
    } catch (logErr) {
      console.warn("NextAuth Google logAuthEvent failed:", logErr.message);
    }

    const token = await user.getSignedJwtToken();

    const cookieOptions = {
      expires: new Date(
        Date.now() +
          (parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 24) *
            24 *
            60 *
            60 *
            1000,
      ),
      httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
    }

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || image,
      },
    });
  } catch (error) {
    console.error("nextauthGoogleSync error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not complete Google sign-in. Please try again.",
    });
  }
}
