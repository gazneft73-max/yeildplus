import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser, ApiError } from "@/lib/server/api";
import { applyBalanceChange } from "@/lib/server/ledger";
import { round } from "@/lib/utils";
import type { InvestmentDoc, InvestmentPlanDoc } from "@/lib/types";

export const POST = handle(async (req) => {
  const { session } = await requireActiveUser();
  const body = await parseBody(req, z.object({ planId: z.string().min(1), amount: z.number().positive("Enter an amount") }));
  const planSnap = await db().collection("investmentPlans").doc(body.planId).get();
  if (!planSnap.exists) throw new ApiError("Plan not found", 404);
  const plan = planSnap.data() as InvestmentPlanDoc;
  if (!plan.active) throw new ApiError("This plan is no longer available");
  if (body.amount < plan.minAmount) throw new ApiError("Minimum for this plan is " + plan.minAmount + " USDT");
  if (plan.maxAmount > 0 && body.amount > plan.maxAmount) throw new ApiError("Maximum for this plan is " + plan.maxAmount + " USDT");

  const amount = round(body.amount, 2);
  const totalProfit = round(amount * (plan.roiPercent / 100), 2);
  const now = Date.now();
  const ref = db().collection("investments").doc();
  await db().runTransaction(async (tx) => {
    await applyBalanceChange(tx, session.uid, "USDT", -amount, { type: "invest", note: plan.name, refId: ref.id });
    const doc: InvestmentDoc = {
      uid: session.uid,
      userEmail: session.email,
      planId: body.planId,
      planName: plan.name,
      category: plan.category ?? "investing",
      amount,
      roiPercent: plan.roiPercent,
      durationDays: plan.durationDays,
      payout: plan.payout,
      capitalBack: plan.capitalBack,
      dailyProfit: round(totalProfit / plan.durationDays, 4),
      totalProfit,
      startAt: now,
      endAt: now + plan.durationDays * 86_400_000,
      settledDays: 0,
      paidProfit: 0,
      status: "active",
      createdAt: now,
    };
    tx.set(ref, doc);
  });
  return ok({ id: ref.id });
});
