import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";

export function signOAuthState({ role, provider }) {
  return jwt.sign(
    { role, provider, nonce: crypto.randomBytes(16).toString("hex") },
    env.OAUTH_STATE_SECRET,
    { expiresIn: "10m" },
  );
}

export function verifyOAuthState(state) {
  if (!state) {
    throw new Error("Missing OAuth state");
  }
  return jwt.verify(state, env.OAUTH_STATE_SECRET);
}
