import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireAdmin, ApiError } from "@/lib/server/api";
import { presignView } from "@/lib/server/storage";
import { settleAll } from "@/lib/server/settle";
import type { NotificationDoc } from "@/lib/types";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("viewFile"), key: z.string().min(1) }),
  z.object({ action: z.literal("settleAll") }),
  z.object({ action: z.literal("notify"), uid: z.string().min(1), title: z.string().trim().min(2).max(80), body: z.string().trim().min(2).max(500) }),
]);

export const POST = handle(async (req) => {
  await requireAdmin();
  const body = await parseBody(req, schema);
  switch (body.action) {
    case "viewFile": {
      if (!/^(kyc|deposits|support)\//.test(body.key)) throw new ApiError("Invalid file key");
      return ok({ url: await presignView(body.key) });
    }
    case "settleAll":
      return ok({ settled: await settleAll() });
    case "notify": {
      const doc: NotificationDoc = { uid: body.uid, title: body.title, body: body.body, createdAt: Date.now(), read: false };
      await db().collection("notifications").add(doc);
      return ok({});
    }
  }
});
