/**
 * Load demo users into the database (admin, students, companies).
 *
 *   npm run seed
 *
 * Admin login: admin@internhub.demo / Admin@123
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import { seedSampleData } from "../services/sampleSeedService.js";
import {
  SAMPLE_ADMIN,
  SAMPLE_STUDENTS,
  SAMPLE_COMPANIES,
} from "../data/sampleCredentials.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function main() {
  await connectDB();
  await seedSampleData();

  console.log("Sample data seeded successfully.\n");
  console.log("--- Admin (use at /admin/login) ---");
  console.log(`  Email:    ${SAMPLE_ADMIN.email}`);
  console.log(`  Password: ${SAMPLE_ADMIN.password}\n`);
  console.log("--- Students ---");
  SAMPLE_STUDENTS.forEach((s) => {
    console.log(`  ${s.email} / ${s.password}`);
  });
  console.log("\n--- Companies ---");
  SAMPLE_COMPANIES.forEach((c) => {
    console.log(`  ${c.email} / ${c.password} (${c.approval_status})`);
  });
  console.log("");

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
