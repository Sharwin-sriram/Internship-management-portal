/**
 * Reset demo admin password in DB. Run if login still fails:
 *   node src/scripts/fixAdminLogin.js
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ensureSampleAdmin } from "../services/sampleSeedService.js";
import { SAMPLE_ADMIN } from "../data/sampleCredentials.js";
import Admin from "../models/Admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  await ensureSampleAdmin();

  const admin = await Admin.findOne({ email: SAMPLE_ADMIN.email }).select("+password");
  if (!admin) {
    console.error("FAILED: admin still not in database");
    process.exit(1);
  }

  const ok = await admin.comparePassword(SAMPLE_ADMIN.password);
  console.log("Password test:", ok ? "PASS" : "FAIL");
  console.log("Login with:");
  console.log("  Email:", SAMPLE_ADMIN.email);
  console.log("  Password:", SAMPLE_ADMIN.password);

  await mongoose.disconnect();
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
