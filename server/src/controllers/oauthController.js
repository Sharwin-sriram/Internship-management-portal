import passport from "../config/passport.js";
import env from "../config/env.js";
import User from "../models/user.js";
import { signOAuthState, verifyOAuthState } from "../utils/oauthState.js";
import { createOAuthCode, consumeOAuthCode } from "../services/oauthCode.service.js";
import { findOrCreateOAuthUser } from "../services/oauthUser.service.js";
import {
  logAuthEvent,
  AuthEventType,
  AuthEventStatus,
} from "../services/authLog.service.js";

function redirectOAuthError(res, errorCode) {
  const url = new URL("/auth/callback", env.FRONTEND_URL);
  url.searchParams.set("error", errorCode);
  return res.redirect(url.toString());
}

async function completeOAuthLogin(req, res, oauthProfile, stateToken) {
  let statePayload;
  try {
    statePayload = verifyOAuthState(stateToken);
  } catch {
    return redirectOAuthError(res, "invalid_state");
  }

  if (statePayload.provider !== oauthProfile.provider) {
    return redirectOAuthError(res, "invalid_state");
  }

  const { user, isNewUser } = await findOrCreateOAuthUser({
    ...oauthProfile,
    role: statePayload.role,
  });

  try {
    await logAuthEvent({
      userId: user._id,
      eventType: AuthEventType.LOGIN_SUCCESS,
      status: AuthEventStatus.SUCCESS,
      req,
      metadata: {
        provider: oauthProfile.provider,
        isNewUser,
        method: "oauth",
      },
    });
  } catch (logErr) {
    console.warn("OAuth logAuthEvent failed:", logErr.message);
  }

  const exchangeCode = createOAuthCode(user._id);
  const url = new URL("/auth/callback", env.FRONTEND_URL);
  url.searchParams.set("code", exchangeCode);
  return res.redirect(url.toString());
}

function passportCallback(provider) {
  return (req, res, next) => {
    passport.authenticate(provider, { session: false }, async (err, oauthProfile) => {
      try {
        if (err) {
          console.error(`OAuth ${provider} error:`, err.message);
          await logAuthEvent({
            userId: null,
            eventType: AuthEventType.LOGIN_FAILED,
            status: AuthEventStatus.FAILED,
            req,
            metadata: { provider, error: err.message },
          }).catch(() => {});
          return redirectOAuthError(res, "authentication_failed");
        }

        if (!oauthProfile) {
          return redirectOAuthError(res, "access_denied");
        }

        return await completeOAuthLogin(req, res, oauthProfile, req.query.state);
      } catch (error) {
        console.error(`OAuth ${provider} callback error:`, error);
        return redirectOAuthError(res, "server_error");
      }
    })(req, res, next);
  };
}

export function startGoogle(req, res, next) {
  const role = req.query.role === "company" ? "company" : "student";
  const state = signOAuthState({ role, provider: "google" });

  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
    const url = new URL("/login", env.FRONTEND_URL);
    url.searchParams.set("error", "google_credentials_not_configured");
    return res.redirect(url.toString());
  }

  const googleAuthOptions = {
    session: false,
    scope: ["profile", "email"],
    state,
  };

  /** After our in-app consent step, match Google OAuth 2.0 `prompt` behaviour. */
  const promptParts = [];
  if (req.query.select_account === "1") {
    promptParts.push("select_account");
  }
  if (req.query.force_consent === "1") {
    promptParts.push("consent");
  }
  if (promptParts.length > 0) {
    googleAuthOptions.prompt = promptParts.join(" ");
  }

  return passport.authenticate("google", googleAuthOptions)(req, res, next);
}

export const googleCallback = passportCallback("google");

export function startGithub(req, res, next) {
  const role = req.query.role === "company" ? "company" : "student";
  const state = signOAuthState({ role, provider: "github" });

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    const url = new URL("/login", env.FRONTEND_URL);
    url.searchParams.set("error", "github_credentials_not_configured");
    return res.redirect(url.toString());
  }

  return passport.authenticate("github", {
    session: false,
    scope: ["user:email", "read:user"],
    state,
  })(req, res, next);
}

export const githubCallback = passportCallback("github");

export async function exchangeCode(req, res) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

    const userId = consumeOAuthCode(code);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired authorization code",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = user.getSignedJwtToken();

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

    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
  } catch (error) {
    console.error("OAuth exchange error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during OAuth exchange",
    });
  }
}

export async function handleNextAuthLogin(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const secret = process.env.NEXTAUTH_SECRET || "";
    if (!secret || auth !== `Bearer ${secret}`) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { email, name, avatar, role, provider, providerId, googleId } = req.body;

    const resolvedProviderId = googleId || providerId;

    if (!email || !role || !provider || !resolvedProviderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters (email, role, provider, googleId)",
      });
    }

    if (provider !== "google") {
      return res.status(400).json({
        success: false,
        message: "Only google provider is supported via NextAuth",
      });
    }

    const { user, isNewUser } = await findOrCreateOAuthUser({
      provider,
      providerId: resolvedProviderId,
      email,
      name: name || email.split("@")[0],
      avatar: avatar || "",
      role,
    });

    try {
      await logAuthEvent({
        userId: user._id,
        eventType: AuthEventType.LOGIN_SUCCESS,
        status: AuthEventStatus.SUCCESS,
        req,
        metadata: {
          provider,
          isNewUser,
          method: "nextauth-oauth",
        },
      });
    } catch (logErr) {
      console.warn("NextAuth OAuth logAuthEvent failed:", logErr.message);
    }

    const token = user.getSignedJwtToken();

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("NextAuth OAuth authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during NextAuth OAuth authentication",
    });
  }
}
