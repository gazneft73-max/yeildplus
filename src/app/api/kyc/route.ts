import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser, ApiError } from "@/lib/server/api";
import type { KycDoc } from "@/lib/types";

export const POST = handle(async (req) => {
  const { session, user } = await requireActiveUser();
  if (user.kycStatus === "pending") throw new ApiError("Your verification is already under review");
  if (user.kycStatus === "approved") throw new ApiError("You are already verified");
  const body = await parseBody(
    req,
    z.object({
      fullName: z.string().trim().min(2).max(80),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth"),
      documentType: z.enum(["passport", "national_id", "drivers_license"]),
      documentNumber: z.string().trim().min(3).max(40),
      address: z.string().trim().min(5).max(200),
      frontKey: z.string().min(1, "Upload the front of your document"),
      backKey: z.string().optional().or(z.literal("")),
      selfieKey: z.string().min(1, "Upload a selfie holding your document"),
    }),
  );
  const age = (Date.now() - new Date(body.dateOfBirth).getTime()) / (365.25 * 86_400_000);
  if (!(age >= 18)) throw new ApiError("You must be at least 18 years old");
  const doc: KycDoc = {
    uid: session.uid,
    userEmail: session.email,
    ...body,
    backKey: body.backKey || "",
    status: "pending",
    createdAt: Date.now(),
  };
  await db().collection("kyc").doc(session.uid).set(doc);
  await db().collection("users").doc(session.uid).set({ kycStatus: "pending" }, { merge: true });
  return ok({});
});
