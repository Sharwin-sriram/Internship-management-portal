import crypto from "crypto";
import User from "../models/user.js";
import Company from "../models/Company.js";

function randomPassword() {
  return crypto.randomBytes(32).toString("hex") + "Aa1!";
}

async function ensureCompanyProfile(user) {
  if (user.role !== "company") return;

  let company = await Company.findOne({ user: user._id });
  if (!company) {
    await Company.create({
      user: user._id,
      company_name: `${user.name} Inc`,
      approval_status: "approved",
      is_verified: true,
      profile_completed: true,
      primary_contact: {
        name: user.name,
        email: user.email,
      },
    });
  }
}

/**
 * Find or create a user from OAuth provider data.
 * @param {{ provider: 'google'|'github', providerId: string, email: string, name: string, avatar?: string, role?: string }} params
 */
export async function findOrCreateOAuthUser({
  provider,
  providerId,
  email,
  name,
  avatar = "",
  role = "student",
}) {
  const idField = provider === "google" ? "googleId" : "githubId";
  const normalizedEmail = email.toLowerCase().trim();
  const safeRole = role === "company" ? "company" : "student";

  let user = await User.findOne({ [idField]: providerId });
  if (user) {
    if (user.role === "user") {
      user.role = "student";
    }
    if (avatar && !user.avatar) {
      user.avatar = avatar;
    }
    await user.save();
    await ensureCompanyProfile(user);
    return { user, isNewUser: false };
  }

  user = await User.findOne({ email: normalizedEmail });
  if (user) {
    if (user.role === "user") {
      user.role = "student";
    }
    user[idField] = providerId;
    if (user.authProvider === "local") {
      user.authProvider = provider;
    }
    if (avatar && !user.avatar) {
      user.avatar = avatar;
    }
    await user.save();
    await ensureCompanyProfile(user);
    return { user, isNewUser: false };
  }

  user = await User.create({
    name,
    email: normalizedEmail,
    password: randomPassword(),
    role: safeRole,
    [idField]: providerId,
    authProvider: provider,
    avatar,
    emailVerified: true,
  });

  await ensureCompanyProfile(user);
  return { user, isNewUser: true };
}
