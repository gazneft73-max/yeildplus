"use client";

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase-client";
import { api } from "./client-api";

function friendly(code: string | undefined): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/network-request-failed":
      return "Network error. Check your connection";
    case "auth/weak-password":
      return "Password is too weak";
    default:
      return "Sign-in failed. Please try again";
  }
}

/** Signs in with Firebase, then exchanges the ID token for the httpOnly session cookie. */
export async function loginWithPassword(email: string, password: string) {
  const auth = getFirebaseAuth();
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (e) {
    throw new Error(friendly((e as { code?: string }).code));
  }
  const idToken = await cred.user.getIdToken(true);
  try {
    await api("/api/auth/session", { idToken });
  } finally {
    // The server cookie is the source of truth; drop the client session.
    await signOut(auth).catch(() => {});
  }
}

export async function logout() {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
  try {
    await signOut(getFirebaseAuth());
  } catch {}
}

export async function requestPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "auth/user-not-found") return; // do not reveal whether the account exists
    throw new Error(friendly(code));
  }
}

export async function changePassword(email: string, currentPassword: string, newPassword: string) {
  const auth = getFirebaseAuth();
  try {
    const cred = await signInWithEmailAndPassword(auth, email, currentPassword);
    await reauthenticateWithCredential(cred.user, EmailAuthProvider.credential(email, currentPassword));
    await updatePassword(cred.user, newPassword);
  } catch (e) {
    throw new Error(friendly((e as { code?: string }).code));
  } finally {
    await signOut(auth).catch(() => {});
  }
}
