import Admin from "../models/Admin.js";
import User from "../models/user.js";

/**
 * Creates or updates the admin account from server/.env (Admin + User collections).
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then restart the server.
 */
export async function bootstrapAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "System Admin";

  if (!email || !password) {
    return { synced: false, reason: "ADMIN_EMAIL and ADMIN_PASSWORD not set in .env" };
  }

  if (password.length < 6) {
    console.warn("[admin] ADMIN_PASSWORD must be at least 6 characters.");
    return { synced: false, reason: "password too short" };
  }

  let admin = await Admin.findOne({ email }).select("+password");
  const isNewAdmin = !admin;

  if (admin) {
    admin.name = name;
    admin.isActive = true;
    admin.password = password;
    await admin.save();
  } else {
    admin = await Admin.create({
      name,
      email,
      password,
      isActive: true,
    });
    console.log(`[admin] Admin record created from .env: ${email}`);
  }

  let user = await User.findOne({ email }).select("+password");

  if (user) {
    user.name = name;
    user.role = "admin";
    user.isActive = true;
    user.password = password;
    user.emailVerified = true;
    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
      emailVerified: true,
    });
  }

  admin.user = user._id;
  await admin.save();

  console.log(`[admin] Admin credentials synced from .env: ${email}`);
  return { synced: true, email, action: isNewAdmin ? "created" : "updated" };
}
