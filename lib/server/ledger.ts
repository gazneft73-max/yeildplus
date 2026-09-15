import "server-only";
import { db, FieldValue } from "./firebase-admin";
import { round } from "../utils";
import type { Asset, TransactionDoc, TxType, UserDoc } from "../types";
import { ApiError } from "./api";

type Tx = FirebaseFirestore.Transaction;

/**
 * Applies a balance change to a user inside a Firestore transaction and writes a matching
 * transaction record. Throws if the debit would take the balance below zero.
 */
export async function applyBalanceChange(
  tx: Tx,
  uid: string,
  asset: Asset,
  delta: number,
  entry: { type: TxType; note?: string; refId?: string; status?: TransactionDoc["status"] },
) {
  const ref = db().collection("users").doc(uid);
  const snap = await tx.get(ref);
  if (!snap.exists) throw new ApiError("User not found", 404);
  const user = snap.data() as UserDoc;
  const current = user.balances?.[asset] ?? 0;
  const next = round(current + delta);
  if (next < -1e-9) throw new ApiError("Insufficient " + asset + " balance");
  tx.update(ref, { ["balances." + asset]: Math.max(0, next) });
  const txRef = db().collection("transactions").doc();
  const record: TransactionDoc = {
    uid,
    type: entry.type,
    asset,
    amount: round(delta),
    status: entry.status ?? "completed",
    note: entry.note ?? "",
    refId: entry.refId ?? "",
    createdAt: Date.now(),
  };
  tx.set(txRef, record);
  return { before: current, after: next, user };
}

export async function recordTransaction(entry: TransactionDoc) {
  await db().collection("transactions").add(entry);
}

export const inc = (n: number) => FieldValue.increment(n);
