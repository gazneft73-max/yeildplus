import { z } from "zod";
import { handle, ok, parseBody, requireUser } from "@/lib/server/api";
import { presignUpload } from "@/lib/server/storage";

export const POST = handle(async (req) => {
  const s = await requireUser();
  const body = await parseBody(
    req,
    z.object({
      folder: z.enum(["kyc", "deposits", "support"]),
      contentType: z.string(),
      size: z.number().int().positive(),
      filename: z.string().max(200),
    }),
  );
  const r = await presignUpload({ uid: s.uid, ...body });
  return ok(r);
});
