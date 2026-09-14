import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser, ApiError } from "@/lib/server/api";
import { applyBalanceChange } from "@/lib/server/ledger";
import { round } from "@/lib/utils";
import { MINING_ASSETS, type MiningContractDoc, type MiningPlanDoc } from "@/lib/types";

export const POST = handle(async (req) => {
  const { session } = await requireActiveUser();
  const body = await parseBody(req, z.object({ planId: z.string().min(1), quantity: z.number().int().min(1).max(100) }));
  const planSnap = await db().collection("miningPlans").doc(body.planId).get();
  if (!planSnap.exists) throw new ApiError("Mining plan not found", 404);
  const plan = planSnap.data() as MiningPlanDoc;
  if (!plan.active) throw new ApiError("This mining plan is no longer available");
  if (!(MINING_ASSETS as readonly string[]).includes(plan.minesAsset)) throw new ApiError("Unsupported mining asset");

  const price = round(plan.price * body.quantity, 2);
  const grossDaily = price * (plan.dailyReturnPercent / 100);
  const dailyUsd = round(grossDaily * (1 - plan.maintenanceFeePercent / 100), 4);
  const now = Date.now();
  const ref = db().collection("miningContracts").doc();
  await db().runTransaction(async (tx) => {
    await applyBalanceChange(tx, session.uid, "USDT", -price, { type: "mining", note: plan.name + " x" + body.quantity, refId: ref.id });
    const doc: MiningContractDoc = {
      uid: session.uid,
      userEmail: session.email,
      planId: body.planId,
      planName: plan.name + (body.quantity > 1 ? " x" + body.quantity : ""),
      hashrate: body.quantity > 1 ? body.quantity + " x " + plan.hashrate : plan.hashrate,
      minesAsset: plan.minesAsset,
      price,
      durationDays: plan.durationDays,
      dailyUsd,
      startAt: now,
      endAt: now + plan.durationDays * 86_400_000,
      settledDays: 0,
      paidUsd: 0,
      paidAsset: 0,
      status: "active",
      createdAt: now,
    };
    tx.set(ref, doc);
  });
  return ok({ id: ref.id });
});
