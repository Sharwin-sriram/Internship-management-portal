const fs = require("fs");
const path = require("path");

const SESSIONS_FILE = path.join(__dirname, "..", "data", "sessions.json");

function loadSessions() {
  try {
    return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8") || "{}");
  } catch (e) {
    return {};
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf8");
}

function getUserFromSession(req) {
  const token = req.cookies && req.cookies.session;
  if (!token) return null;
  const sessions = loadSessions();
  const userId = sessions[token];
  if (!userId) return null;
  const userModule = require("../models/user");
  const user = userModule.loadUsers().find((u) => u.id === userId);
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

function requireAuth(req, res, next) {
  const user = getUserFromSession(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = getUserFromSession(req);
  if (!user || user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  req.user = user;
  next();
}

module.exports = { requireAuth, requireAdmin, loadSessions, saveSessions };
