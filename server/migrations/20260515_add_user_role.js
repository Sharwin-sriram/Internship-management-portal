// Migration placeholder: add `role` field to users
// This project currently uses a JSON-backed user store at `server/data/users.json`.
// If you migrate to a real DB, convert this script into the DB migration format you use.

const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

function run() {
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  const users = JSON.parse(raw || "[]");
  let changed = false;
  for (const u of users) {
    if (!u.role) {
      u.role = "student";
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    console.log("Migration applied: set missing role to student");
  } else {
    console.log("No changes required");
  }
}

if (require.main === module) run();

module.exports = { run };
