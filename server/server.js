const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const userModule = require("./models/user");
const authMiddleware = require("./middleware/auth");

const SESSIONS_FILE = path.join(__dirname, "data", "sessions.json");

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

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post("/api/register", (req, res) => {
  const { role, email, password, name, companyName } = req.body || {};
  if (!role || !["student", "company"].includes(role))
    return res.status(400).json({ error: "Invalid role" });
  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });
  try {
    const user = userModule.createUser({
      email,
      password,
      role,
      name,
      companyName,
    });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    if (err.code === "DUPLICATE_EMAIL")
      return res.status(409).json({ error: "Email exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });
  const user = userModule.findByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = userModule.verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = crypto.randomBytes(24).toString("hex");
  const sessions = loadSessions();
  sessions[token] = user.id;
  saveSessions(sessions);
  res.cookie("session", token, { httpOnly: true, sameSite: "lax" });
  res.json({ id: user.id, email: user.email, role: user.role });
});

app.post("/api/admin/users", authMiddleware.requireAdmin, (req, res) => {
  const { role, email, password, name } = req.body || {};
  if (!role || !["admin", "coordinator"].includes(role))
    return res.status(400).json({ error: "Invalid role for admin creation" });
  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });
  try {
    const user = userModule.createUser({ email, password, role, name });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    if (err.code === "DUPLICATE_EMAIL")
      return res.status(409).json({ error: "Email exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/me", (req, res) => {
  const user = authMiddleware.loadSessions ? null : null; // placeholder
  const token = req.cookies && req.cookies.session;
  if (!token) return res.json({ user: null });
  const sessions = loadSessions();
  const userId = sessions[token];
  if (!userId) return res.json({ user: null });
  const u = userModule.loadUsers().find((x) => x.id === userId);
  if (!u) return res.json({ user: null });
  res.json({ user: { id: u.id, email: u.email, role: u.role } });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth server listening on ${PORT}`));

module.exports = app;
