"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseClientConfig, isFirebaseConfigured } from "./env";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);
  return app;
}

export function getFirebaseAuth(): Auth {
  const a = getFirebaseApp();
  if (!a) throw new Error("Firebase is not configured. Fill in NEXT_PUBLIC_FIREBASE_* in .env.local.");
  if (!auth) auth = getAuth(a);
  return auth;
}
