import "server-only";
import { cache } from "react";
import { db } from "./firebase-admin";
import { DEFAULT_SETTINGS, type SettingsDoc } from "../types";

export const getSettings = cache(async (): Promise<SettingsDoc> => {
  try {
    const snap = await db().collection("settings").doc("general").get();
    if (!snap.exists) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SettingsDoc>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export async function saveSettings(patch: Partial<SettingsDoc>) {
  await db().collection("settings").doc("general").set(patch, { merge: true });
}
