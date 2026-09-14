import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireUser } from "@/lib/server/api";

/** Mark the user's notifications as read. */
export const PATCH = handle(async (req) => {
  const s = await requireUser();
  const { ids } = await parseBody(req, z.object({ ids: z.array(z.string()).max(100) }));
  const batch = db().batch();
  for (const id of ids) {
    const ref = db().collection("notifications").doc(id);
    const snap = await ref.get();
    if (snap.exists && snap.data()?.uid === s.uid) batch.update(ref, { read: true });
  }
  await batch.commit();
  return ok({});
});
