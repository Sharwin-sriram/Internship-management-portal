import crypto from "crypto";

const codes = new Map();
const TTL_MS = 60 * 1000;

function purgeExpired() {
  const now = Date.now();
  for (const [key, entry] of codes) {
    if (entry.expiresAt < now) {
      codes.delete(key);
    }
  }
}

export function createOAuthCode(userId) {
  purgeExpired();
  const code = crypto.randomBytes(32).toString("hex");
  codes.set(code, {
    userId: String(userId),
    expiresAt: Date.now() + TTL_MS,
  });
  return code;
}

export function consumeOAuthCode(code) {
  if (!code) return null;
  const entry = codes.get(code);
  codes.delete(code);
  if (!entry || entry.expiresAt < Date.now()) {
    return null;
  }
  return entry.userId;
}
