import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

function loadServiceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const json = JSON.parse(text);
  if (typeof json.private_key === "string") json.private_key = json.private_key.replace(/\n/g, "\n");
  return json;
}

let app: App | null = null;

export function adminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }
  const sa = loadServiceAccount();
  if (!sa) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set.");
  app = initializeApp({ credential: cert(sa as never), projectId: sa.project_id });
  return app;
}

export const adminAuth = () => getAuth(adminApp());
export const db = () => getFirestore(adminApp());
export { FieldValue, Timestamp };
