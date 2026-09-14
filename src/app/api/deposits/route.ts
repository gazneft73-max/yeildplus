import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser, ApiError } from "@/lib/server/api";
import { getSettings } from "@/lib/server/settings";
import { getPrices } from "@/lib/server/prices";
import { ASSET_SYMBOLS, type DepositDoc, type TransactionDoc } from "@/lib/types";

export const POST = handle(async (req) => {
  const { session } = await requireActiveUser();
  const body = await parseBody(
    req,
    z.object({
      asset: z.enum(ASSET_SYMBOLS),
      amount: z.number().positive("Enter an amount"),
      txHash: z.string().trim().max(128).optional().or(z.literal("")),
      proofKey: z.string().max(256).optional().or(z.literal("")),
    }),
  );
  const [settings, prices] = await Promise.all([getSettings(), getPrices()]);
  const addr = settings.depositAddresses[body.asset];
  if (!addr?.address) throw new ApiError("Deposits for " + body.asset + " are temporarily unavailable");
  const usd = body.amount * prices[body.asset].usd;
  if (usd < settings.minDeposit) throw new ApiError("Minimum deposit is $" + settings.minDeposit + " equivalent");
  if (!body.txHash && !body.proofKey) throw new ApiError("Add the transaction hash or upload a payment proof");

  const pending = await db().collection("deposits").where("uid", "==", session.uid).where("status", "==", "pending").count().get();
  if (pending.data().count >= 5) throw new ApiError("You already have 5 deposits awaiting review");

  const doc: DepositDoc = {
    uid: session.uid,
    userEmail: session.email,
    asset: body.asset,
    network: addr.network,
    amount: body.amount,
    txHash: body.txHash || "",
    proofKey: body.proofKey || "",
    status: "pending",
    createdAt: Date.now(),
  };
  const ref = await db().collection("deposits").add(doc);
  const tx: TransactionDoc = {
    uid: session.uid, type: "deposit", asset: body.asset, amount: body.amount, status: "pending",
    note: "Deposit awaiting confirmation", refId: ref.id, createdAt: Date.now(),
  };
  await db().collection("transactions").add(tx);
  return ok({ id: ref.id });
});
