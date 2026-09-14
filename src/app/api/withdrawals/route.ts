import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser, ApiError } from "@/lib/server/api";
import { getSettings } from "@/lib/server/settings";
import { getPrices } from "@/lib/server/prices";
import { applyBalanceChange } from "@/lib/server/ledger";
import { round } from "@/lib/utils";
import { ASSET_SYMBOLS, assetInfo, type WithdrawalDoc } from "@/lib/types";

export const POST = handle(async (req) => {
  const { session, user } = await requireActiveUser();
  const body = await parseBody(
    req,
    z.object({
      asset: z.enum(ASSET_SYMBOLS),
      amount: z.number().positive("Enter an amount"),
      address: z.string().trim().min(10, "Enter a valid wallet address").max(128),
    }),
  );
  if (user.kycStatus !== "approved") throw new ApiError("Complete identity verification (KYC) before withdrawing");
  const [settings, prices] = await Promise.all([getSettings(), getPrices()]);
  const usd = body.amount * prices[body.asset].usd;
  if (usd < settings.minWithdrawal) throw new ApiError("Minimum withdrawal is $" + settings.minWithdrawal + " equivalent");
  const fee = round(body.amount * (settings.withdrawalFeePercent / 100), 8);

  const pending = await db().collection("withdrawals").where("uid", "==", session.uid).where("status", "==", "pending").count().get();
  if (pending.data().count >= 3) throw new ApiError("You already have 3 withdrawals awaiting review");

  const ref = db().collection("withdrawals").doc();
  await db().runTransaction(async (tx) => {
    // Funds are held (debited) immediately and refunded if the admin rejects.
    await applyBalanceChange(tx, session.uid, body.asset, -body.amount, {
      type: "withdrawal", note: "Withdrawal to " + body.address.slice(0, 8) + "... (pending)", refId: ref.id, status: "pending",
    });
    const doc: WithdrawalDoc = {
      uid: session.uid,
      userEmail: session.email,
      asset: body.asset,
      network: assetInfo(body.asset)?.network ?? "",
      address: body.address,
      amount: body.amount,
      fee,
      status: "pending",
      createdAt: Date.now(),
    };
    tx.set(ref, doc);
  });
  return ok({ id: ref.id });
});
