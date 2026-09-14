import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireAdmin, ApiError } from "@/lib/server/api";
import type { TicketMessageDoc } from "@/lib/types";

export const POST = handle(async (req) => {
  await requireAdmin();
  const body = await parseBody(
    req,
    z.object({ ticketId: z.string().min(1), message: z.string().trim().max(4000).optional(), status: z.enum(["open", "answered", "closed"]).optional() }),
  );
  const ref = db().collection("tickets").doc(body.ticketId);
  const snap = await ref.get();
  if (!snap.exists) throw new ApiError("Ticket not found", 404);
  const now = Date.now();
  const patch: Record<string, unknown> = { updatedAt: now };
  if (body.message) {
    const msg: TicketMessageDoc = { from: "admin", body: body.message, createdAt: now };
    await ref.collection("messages").add(msg);
    patch.status = "answered";
    patch.lastMessage = body.message.slice(0, 140);
  }
  if (body.status) patch.status = body.status;
  await ref.update(patch);
  return ok({});
});
