/**
 * Fix corrupted user roles in database
 * Run: node src/scripts/fixUserRoles.js
 *
 * This script:
 * 1. Finds users with invalid or corrupted roles
 * 2. Resets them to 'student' (the safe default)
 * 3. Reports before/after statistics
 */

import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import User from "../models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function fixUserRoles() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/internship-portal";
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    const validRoles = ["admin", "coordinator", "student", "company", "interviewer"];

    // Find users with invalid roles
    const invalidUsers = await User.find({
      $or: [
        { role: { $nin: validRoles } },
        { role: null },
        { role: "" }
      ]
    });

    console.log(`\n📊 Found ${invalidUsers.length} users with invalid roles`);

    if (invalidUsers.length === 0) {
      console.log("✓ All users have valid roles!");
      await mongoose.connection.close();
      return;
    }

    // Show before statistics
    const roleCounts = {};
    for (const user of invalidUsers) {
      roleCounts[user.role || "null"] = (roleCounts[user.role || "null"] || 0) + 1;
    }

    console.log("\n📋 Invalid roles found:");
    for (const [role, count] of Object.entries(roleCounts)) {
      console.log(`   - ${role || "null"}: ${count} users`);
    }

    // Fix users
    const bulkOps = invalidUsers.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { role: "student" } }
      }
    }));

    if (bulkOps.length > 0) {
      const result = await User.bulkWrite(bulkOps);
      console.log(`\n✅ Fixed ${result.modifiedCount} users`);
      console.log(`   - Reset invalid roles to 'student'`);
    }

    // Verify fix
    const stillInvalid = await User.find({
      $or: [
        { role: { $nin: validRoles } },
        { role: null },
        { role: "" }
      ]
    });

    if (stillInvalid.length === 0) {
      console.log("\n✓ All users now have valid roles!");
    } else {
      console.log(`\n⚠️  Warning: ${stillInvalid.length} users still have invalid roles`);
    }

    // Show user counts by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log("\n📈 Users by role after fix:");
    for (const role of usersByRole) {
      console.log(`   - ${role._id || "null"}: ${role.count} users`);
    }

    await mongoose.connection.close();
    console.log("\n✓ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixUserRoles();
