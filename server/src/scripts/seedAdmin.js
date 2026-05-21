/**
 * Sync admin user from server/.env (same as server startup).
 * Run: node src/scripts/seedAdmin.js
 *
 * Edit ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import { bootstrapAdminFromEnv } from "../services/adminBootstrap.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function seed() {
  await connectDB();
  const result = await bootstrapAdminFromEnv();
  if (!result.synced) {
    console.error(result.reason || "Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env");
    process.exit(1);
  }
  console.log(`Done (${result.action}): ${result.email}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
