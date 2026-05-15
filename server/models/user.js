const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function loadUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}$${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const [salt, derived] = stored.split("$");
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(check, "hex"),
    Buffer.from(derived, "hex"),
  );
}

function findByEmail(email) {
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function createUser({ email, password, role, name, companyName }) {
  const users = loadUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    const err = new Error("Email already exists");
    err.code = "DUPLICATE_EMAIL";
    throw err;
  }
  const id = crypto.randomBytes(12).toString("hex");
  const now = new Date().toISOString();
  const user = {
    id,
    email,
    passwordHash: hashPassword(password),
    role,
    name: name || null,
    companyName: companyName || null,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  saveUsers(users);
  return { ...user, passwordHash: undefined };
}

module.exports = {
  loadUsers,
  saveUsers,
  findByEmail,
  createUser,
  verifyPassword,
};
