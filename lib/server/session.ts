import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { adminAuth, db } from "./firebase-admin";
import type { UserDoc } from "../types";

export const SESSION_COOKIE = "pv_session";
export const SESSION_DAYS = 7;

export type SessionUser = {
  uid: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
};

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Verifies the session cookie. Returns null when absent or invalid. */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(token, true);
    const email = (decoded.email || "").toLowerCase();
    const isAdmin = Boolean(decoded.admin) || (email !== "" && adminEmails().includes(email));
    return { uid: decoded.uid, email, emailVerified: Boolean(decoded.email_verified), isAdmin };
  } catch {
    return null;
  }
});

export const getCurrentUserDoc = cache(async (): Promise<(UserDoc & { uid: string }) | null> => {
  const s = await getSession();
  if (!s) return null;
  const snap = await db().collection("users").doc(s.uid).get();
  if (!snap.exists) return null;
  return { uid: s.uid, ...(snap.data() as UserDoc) };
});
