import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireAdmin, ApiError } from "@/lib/server/api";
import { applyBalanceChange, inc } from "@/lib/server/ledger";
import { getSettings } from "@/lib/server/settings";
import { getPrices } from "@/lib/server/prices";
import { round } from "@/lib/utils";
import type { CardDoc, DepositDoc, KycDoc, LoanDoc, TransactionDoc, UserDoc, WithdrawalDoc } from "@/lib/types";

const schema = z.object({
  kind: z.enum(["deposit", "withdrawal", "kyc", "loan", "card"]),
  id: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  txHash: z.string().trim().max(128).optional().or(z.literal("")),
});

async function markPendingTx(refId: string, status: "completed" | "rejected", note: string) {
  const snap = await db().collection("transactions").where("refId", "==", refId).where("status", "==", "pending").get();
  for (const d of snap.docs) await d.ref.update({ status, note });
}

/** One endpoint for every admin approve/reject decision. Each branch is transactional. */
export const POST = handle(async (req) => {
  await requireAdmin();
  const body = await parseBody(req, schema);
  const now = Date.now();
  const note = body.note || "";
  const approve = body.decision === "approve";

  if (body.kind === "deposit") {
    const ref = db().collection("deposits").doc(body.id);
    let dep: DepositDoc | null = null;
    await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new ApiError("Deposit not found", 404);
      dep = snap.data() as DepositDoc;
      if (dep.status !== "pending") throw new ApiError("Already reviewed");
      if (approve) {
        const { user } = await applyBalanceChange(tx, dep.uid, dep.asset, dep.amount, { type: "deposit", note: "Deposit confirmed", refId: body.id });
        const usd = dep.amount * (await getPrices())[dep.asset].usd;
        tx.update(db().collection("users").doc(dep.uid), { totalDeposited: inc(round(usd, 2)) });
        // First approved deposit pays the referrer a one-time bonus in USDT.
        if (user.referredBy && !user.referralPaid) {
          const settings = await getSettings();
          const bonus = round(usd * (settings.referralPercent / 100), 2);
          if (bonus > 0) {
            await applyBalanceChange(tx, user.referredBy, "USDT", bonus, { type: "referral", note: "Referral bonus from " + user.username, refId: body.id });
            tx.update(db().collection("users").doc(user.referredBy), { referralEarnings: inc(bonus) });
          }
          tx.update(db().collection("users").doc(dep.uid), { referralPaid: true });
        }
      }
      tx.update(ref, { status: approve ? "approved" : "rejected", adminNote: note, reviewedAt: now });
    });
    await markPendingTx(body.id, approve ? "completed" : "rejected", approve ? "Deposit confirmed" : "Deposit rejected" + (note ? ": " + note : ""));
    return ok({});
  }

  if (body.kind === "withdrawal") {
    const ref = db().collection("withdrawals").doc(body.id);
    await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new ApiError("Withdrawal not found", 404);
      const w = snap.data() as WithdrawalDoc;
      if (w.status !== "pending") throw new ApiError("Already reviewed");
      if (approve) {
        const usd = w.amount * (await getPrices())[w.asset].usd;
        tx.update(db().collection("users").doc(w.uid), { totalWithdrawn: inc(round(usd, 2)) });
      } else {
        // Refund the held funds.
        await applyBalanceChange(tx, w.uid, w.asset, w.amount, { type: "withdrawal", note: "Withdrawal rejected - refunded", refId: body.id });
      }
      tx.update(ref, { status: approve ? "approved" : "rejected", adminNote: note, txHash: body.txHash || "", reviewedAt: now });
    });
    await markPendingTx(body.id, approve ? "completed" : "rejected", approve ? "Withdrawal sent" : "Withdrawal rejected");
    return ok({});
  }

  if (body.kind === "kyc") {
    const ref = db().collection("kyc").doc(body.id);
    const snap = await ref.get();
    if (!snap.exists) throw new ApiError("KYC submission not found", 404);
    const k = snap.data() as KycDoc;
    if (k.status !== "pending") throw new ApiError("Already reviewed");
    await ref.update({ status: approve ? "approved" : "rejected", adminNote: note, reviewedAt: now });
    await db().collection("users").doc(k.uid).set({ kycStatus: approve ? "approved" : "rejected" }, { merge: true });
    return ok({});
  }

  if (body.kind === "loan") {
    const ref = db().collection("loans").doc(body.id);
    await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new ApiError("Loan not found", 404);
      const loan = snap.data() as LoanDoc;
      if (loan.status !== "pending") throw new ApiError("Already reviewed");
      if (approve) {
        await applyBalanceChange(tx, loan.uid, "USDT", loan.amount, { type: "loan", note: "Loan disbursed", refId: body.id });
      }
      tx.update(ref, {
        status: approve ? "approved" : "rejected",
        adminNote: note,
        reviewedAt: now,
        dueAt: approve ? now + loan.durationMonths * 30 * 86_400_000 : undefined,
      });
    });
    return ok({});
  }

  if (body.kind === "card") {
    const ref = db().collection("cards").doc(body.id);
    await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new ApiError("Card not found", 404);
      const card = snap.data() as CardDoc;
      if (card.status !== "pending") throw new ApiError("Already reviewed");
      if (!approve) {
        const settings = await getSettings();
        if (settings.cardIssueFee > 0) {
          await applyBalanceChange(tx, card.uid, "USDT", settings.cardIssueFee, { type: "card_funding", note: "Card issue fee refunded", refId: body.id });
        }
      }
      tx.update(ref, { status: approve ? "active" : "rejected", adminNote: note, reviewedAt: now });
    });
    return ok({});
  }

  throw new ApiError("Unknown review kind");
});

export type { TransactionDoc, UserDoc };
