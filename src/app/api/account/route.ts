import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser } from "@/lib/server/api";

/** Update editable profile fields. */
export const PATCH = handle(async (req) => {
  const { session } = await requireActiveUser();
  const body = await parseBody(
    req,
    z.object({
      fullName: z.string().trim().min(2).max(80).optional(),
      phone: z.string().trim().min(6).max(24).optional(),
      country: z.string().trim().min(2).max(64).optional(),
      currency: z.string().trim().length(3).optional(),
    }),
  );
  const patch: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) if (v !== undefined) patch[k] = k === "currency" ? v.toUpperCase() : v;
  if (Object.keys(patch).length) await db().collection("users").doc(session.uid).set(patch, { merge: true });
  return ok({});
});
