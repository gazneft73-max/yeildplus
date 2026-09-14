import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser, ApiError } from "@/lib/server/api";
import { getSettings } from "@/lib/server/settings";
import { applyBalanceChange } from "@/lib/server/ledger";
import { round } from "@/lib/utils";
import type { CardDoc } from "@/lib/types";

/** Request a new card. The issue fee is charged now; the card activates once approved. */
export const POST = handle(async (req) => {
  const { session, user } = await requireActiveUser();
  const body = await parseBody(req, z.object({ type: z.enum(["virtual", "physical"]), holderName: z.string().trim().min(2).max(40) }));
  if (user.kycStatus !== "approved") throw new ApiError("Complete identity verification (KYC) before requesting a card");
  const existing = await db().collection("cards").where("uid", "==", session.uid).where("status", "in", ["pending", "active", "frozen"]).count().get();
  if (existing.data().count >= 2) throw new ApiError("You can hold at most 2 cards");
  const settings = await getSettings();
  const ref = db().collection("cards").doc();
  const now = new Date();
  await db().runTransaction(async (tx) => {
    if (settings.cardIssueFee > 0) {
      await applyBalanceChange(tx, session.uid, "USDT", -settings.cardIssueFee, { type: "card_funding", note: "Card issue fee", refId: ref.id });
    }
    const doc: CardDoc = {
      uid: session.uid,
      userEmail: session.email,
      holderName: body.holderName.toUpperCase(),
      type: body.type,
      currency: "USD",
      balance: 0,
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expMonth: now.getMonth() + 1,
      expYear: now.getFullYear() + 4,
      status: "pending",
      createdAt: Date.now(),
    };
    tx.set(ref, doc);
  });
  return ok({ id: ref.id });
});

/** Fund an active card from the USDT balance (1 USDT = 1 USD). */
export const PATCH = handle(async (req) => {
  const { session } = await requireActiveUser();
  const body = await parseBody(req, z.object({ cardId: z.string().min(1), amount: z.number().positive() }));
  const ref = db().collection("cards").doc(body.cardId);
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ApiError("Card not found", 404);
    const card = snap.data() as CardDoc;
    if (card.uid !== session.uid) throw new ApiError("Card not found", 404);
    if (card.status !== "active") throw new ApiError("Only active cards can be funded");
    const amt = round(body.amount, 2);
    await applyBalanceChange(tx, session.uid, "USDT", -amt, { type: "card_funding", note: "Card top-up **** " + card.last4, refId: body.cardId });
    tx.update(ref, { balance: round(card.balance + amt, 2) });
  });
  return ok({});
});
