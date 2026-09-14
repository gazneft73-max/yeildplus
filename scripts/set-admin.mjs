#!/usr/bin/env node
/**
 * Grants (or revokes) the `admin` custom claim on a Firebase user so they can open /admin.
 *
 *   npm run set-admin -- admin@example.com          # grant
 *   npm run set-admin -- admin@example.com --revoke # revoke
 *
 * Requires FIREBASE_SERVICE_ACCOUNT in the environment (or in .env.local).
 * Setting ADMIN_EMAIL in the environment works too and needs no script; the claim is an
 * alternative that survives changes to environment variables.
 */
import { readFileSync, existsSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!process.env.FIREBASE_SERVICE_ACCOUNT && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT is not set.");
  process.exit(1);
}
const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Usage: npm run set-admin -- <email> [--revoke]");
  process.exit(1);
}
const json = JSON.parse(raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
if (typeof json.private_key === "string") json.private_key = json.private_key.replace(/\\n/g, "\n");
initializeApp({ credential: cert(json) });
const auth = getAuth();
const user = await auth.getUserByEmail(email);
const revoke = flag === "--revoke";
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: revoke ? undefined : true });
await auth.revokeRefreshTokens(user.uid);
console.log(`${revoke ? "Revoked" : "Granted"} admin for ${email} (${user.uid}). They must sign in again.`);
