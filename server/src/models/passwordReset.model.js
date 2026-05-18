import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../../data/passwordResets.json");

class PasswordReset {
  static async ensureDataFile() {
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
  }

  static async findAll() {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  }

  static async findByToken(token) {
    const resets = await this.findAll();
    const reset = resets.find((r) => r.token === token);

    if (!reset) return null;

    // Check if token has expired (1 hour TTL)
    const expiryTime = new Date(reset.expiresAt).getTime();
    const now = Date.now();

    if (now > expiryTime) {
      await this.delete(token);
      return null;
    }

    return reset;
  }

  static async findByUserId(userId) {
    const resets = await this.findAll();
    return resets.filter((r) => r.userId === userId);
  }

  static async create(userId, email) {
    const resets = await this.findAll();

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const resetToken = {
      id: Date.now().toString(),
      userId,
      email,
      token,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    };

    resets.push(resetToken);
    await fs.writeFile(DATA_FILE, JSON.stringify(resets, null, 2));

    return resetToken;
  }

  static async markAsUsed(token) {
    const resets = await this.findAll();
    const index = resets.findIndex((r) => r.token === token);

    if (index === -1) return null;

    resets[index].used = true;
    resets[index].usedAt = new Date().toISOString();

    await fs.writeFile(DATA_FILE, JSON.stringify(resets, null, 2));
    return resets[index];
  }

  static async delete(token) {
    const resets = await this.findAll();
    const filtered = resets.filter((r) => r.token !== token);
    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
    return true;
  }

  static async deleteByUserId(userId) {
    const resets = await this.findAll();
    const filtered = resets.filter((r) => r.userId !== userId);
    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
    return true;
  }

  static async cleanupExpired() {
    const resets = await this.findAll();
    const now = Date.now();
    const active = resets.filter((r) => {
      const expiryTime = new Date(r.expiresAt).getTime();
      return now <= expiryTime;
    });
    await fs.writeFile(DATA_FILE, JSON.stringify(active, null, 2));
    return resets.length - active.length;
  }
}

export default PasswordReset;
