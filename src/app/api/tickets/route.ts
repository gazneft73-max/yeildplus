import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser, ApiError } from "@/lib/server/api";
import type { TicketDoc, TicketMessageDoc } from "@/lib/types";

export const POST = handle(async (req) => {
  const { session } = await requireActiveUser();
  const body = await parseBody(
    req,
    z.object({
      subject: z.string().trim().min(3, "Add a subject").max(120),
      message: z.string().trim().min(5, "Describe your issue").max(4000),
      priority: z.enum(["low", "normal", "high"]).default("normal"),
    }),
  );
  const now = Date.now();
  const doc: TicketDoc = {
    uid: session.uid, userEmail: session.email, subject: body.subject, status: "open", priority: body.priority ?? "normal",
    createdAt: now, updatedAt: now, lastMessage: body.message.slice(0, 140),
  };
  const ref = await db().collection("tickets").add(doc);
  const msg: TicketMessageDoc = { from: "user", body: body.message, createdAt: now };
  await ref.collection("messages").add(msg);
  return ok({ id: ref.id });
});

/** Add a reply to the user's own ticket. */
export const PATCH = handle(async (req) => {
  const { session } = await requireActiveUser();
  const body = await parseBody(req, z.object({ ticketId: z.string().min(1), message: z.string().trim().min(1).max(4000) }));
  const ref = db().collection("tickets").doc(body.ticketId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.uid !== session.uid) throw new ApiError("Ticket not found", 404);
  if (snap.data()?.status === "closed") throw new ApiError("This ticket is closed");
  const now = Date.now();
  const msg: TicketMessageDoc = { from: "user", body: body.message, createdAt: now };
  await ref.collection("messages").add(msg);
  await ref.update({ status: "open", updatedAt: now, lastMessage: body.message.slice(0, 140) });
  return ok({});
});
