import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { adminAuth, db } from "@/lib/server/firebase-admin";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/server/session";
import { handle, ok, parseBody, ApiError } from "@/lib/server/api";

/** Exchanges a Firebase ID token for an httpOnly session cookie. */
export const POST = handle(async (req) => {
  const { idToken } = await parseBody(req, z.object({ idToken: z.string().min(10) }));
  const decoded = await adminAuth().verifyIdToken(idToken, true).catch(() => null);
  if (!decoded) throw new ApiError("Invalid sign-in token", 401);
  // Only tokens minted in the last 5 minutes may create a session.
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) throw new ApiError("Please sign in again", 401);

  const userRef = db().collection("users").doc(decoded.uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new ApiError("Account profile missing. Please register first.", 403);
  if (snap.data()?.status === "suspended") throw new ApiError("Your account is suspended. Contact support.", 403);

  const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
  const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });
  await userRef.set({ lastLoginAt: Date.now() }, { merge: true });
  return ok({});
});

export const DELETE = handle(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  jar.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  if (token) {
    try {
      const d = await adminAuth().verifySessionCookie(token);
      await adminAuth().revokeRefreshTokens(d.uid);
    } catch {}
  }
  return NextResponse.json({ ok: true });
});
