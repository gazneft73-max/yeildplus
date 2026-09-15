import { z } from "zod";
import { adminAuth, db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireAdmin, ApiError } from "@/lib/server/api";
import { applyBalanceChange } from "@/lib/server/ledger";
import { ASSET_SYMBOLS } from "@/lib/types";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("adjust"), uid: z.string(), asset: z.enum(ASSET_SYMBOLS), amount: z.number(), note: z.string().trim().min(2).max(200) }),
  z.object({ action: z.literal("status"), uid: z.string(), status: z.enum(["active", "suspended"]) }),
  z.object({ action: z.literal("kyc"), uid: z.string(), kycStatus: z.enum(["none", "pending", "approved", "rejected"]) }),
  z.object({ action: z.literal("notes"), uid: z.string(), notes: z.string().max(2000) }),
  z.object({ action: z.literal("resetPassword"), uid: z.string() }),
]);

export const POST = handle(async (req) => {
  await requireAdmin();
  const body = await parseBody(req, schema);
  const userRef = db().collection("users").doc(body.uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new ApiError("User not found", 404);

  switch (body.action) {
    case "adjust": {
      if (body.amount === 0) throw new ApiError("Amount cannot be zero");
      await db().runTransaction(async (tx) => {
        await applyBalanceChange(tx, body.uid, body.asset, body.amount, { type: "adjustment", note: body.note });
      });
      return ok({});
    }
    case "status": {
      await userRef.update({ status: body.status });
      if (body.status === "suspended") await adminAuth().revokeRefreshTokens(body.uid).catch(() => {});
      return ok({});
    }
    case "kyc": {
      await userRef.update({ kycStatus: body.kycStatus });
      return ok({});
    }
    case "notes": {
      await userRef.update({ notes: body.notes });
      return ok({});
    }
    case "resetPassword": {
      const email = snap.data()?.email as string;
      const link = await adminAuth().generatePasswordResetLink(email);
      return ok({ link });
    }
  }
});
