import "server-only";
import { db } from "./firebase-admin";
import { getPrices } from "./prices";
import { round } from "../utils";
import type { InvestmentDoc, MiningContractDoc, TransactionDoc } from "../types";

const DAY = 86_400_000;

/** Whole days elapsed since start, capped at the term length. */
export function elapsedDays(startAt: number, durationDays: number, now = Date.now()) {
  return Math.min(durationDays, Math.max(0, Math.floor((now - startAt) / DAY)));
}

/** Profit accrued so far, for display (continuous, not day-stepped). */
export function investmentAccrued(inv: InvestmentDoc, now = Date.now()) {
  const t = Math.min(1, Math.max(0, (now - inv.startAt) / (inv.endAt - inv.startAt)));
  return round(inv.totalProfit * t, 2);
}

/**
 * Credits any unpaid daily profit for one investment and returns capital at maturity.
 * Safe to call repeatedly; runs in a transaction so concurrent calls cannot double-pay.
 */
async function settleInvestment(id: string, now: number) {
  const ref = db().collection("investments").doc(id);
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const inv = snap.data() as InvestmentDoc;
    if (inv.status !== "active") return;
    const days = elapsedDays(inv.startAt, inv.durationDays, now);
    const matured = days >= inv.durationDays;
    let credit = 0;
    const entries: TransactionDoc[] = [];

    if (inv.payout === "daily") {
      const newDays = days - inv.settledDays;
      if (newDays > 0) {
        const profit = round(inv.dailyProfit * newDays, 2);
        credit += profit;
        entries.push({
          uid: inv.uid, type: "profit", asset: "USDT", amount: profit, status: "completed",
          note: inv.planName + " daily profit x" + newDays, refId: id, createdAt: now,
        });
      }
    } else if (matured) {
      const profit = round(inv.totalProfit - inv.paidProfit, 2);
      if (profit > 0) {
        credit += profit;
        entries.push({
          uid: inv.uid, type: "profit", asset: "USDT", amount: profit, status: "completed",
          note: inv.planName + " matured profit", refId: id, createdAt: now,
        });
      }
    }

    if (matured && inv.capitalBack) {
      credit += inv.amount;
      entries.push({
        uid: inv.uid, type: "capital_return", asset: "USDT", amount: inv.amount, status: "completed",
        note: inv.planName + " capital returned", refId: id, createdAt: now,
      });
    }

    if (credit === 0 && !matured) return;

    const userRef = db().collection("users").doc(inv.uid);
    const userSnap = await tx.get(userRef);
    const balances = (userSnap.data()?.balances ?? {}) as Record<string, number>;
    tx.update(userRef, { "balances.USDT": round((balances.USDT ?? 0) + credit, 8) });
    const paidProfit = round(inv.paidProfit + entries.filter((e) => e.type === "profit").reduce((s, e) => s + e.amount, 0), 2);
    tx.update(ref, { settledDays: days, paidProfit, status: matured ? "completed" : "active" });
    for (const e of entries) tx.set(db().collection("transactions").doc(), e);
  });
}

async function settleMining(id: string, now: number, priceUsd: number) {
  const ref = db().collection("miningContracts").doc(id);
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const c = snap.data() as MiningContractDoc;
    if (c.status !== "active") return;
    const days = elapsedDays(c.startAt, c.durationDays, now);
    const newDays = days - c.settledDays;
    const matured = days >= c.durationDays;
    if (newDays <= 0 && !matured) return;

    const usd = round(c.dailyUsd * newDays, 2);
    const assetAmount = priceUsd > 0 ? round(usd / priceUsd, 8) : 0;
    if (assetAmount > 0) {
      const userRef = db().collection("users").doc(c.uid);
      const userSnap = await tx.get(userRef);
      const balances = (userSnap.data()?.balances ?? {}) as Record<string, number>;
      tx.update(userRef, { ["balances." + c.minesAsset]: round((balances[c.minesAsset] ?? 0) + assetAmount, 8) });
      const e: TransactionDoc = {
        uid: c.uid, type: "mining_payout", asset: c.minesAsset, amount: assetAmount, status: "completed",
        note: c.planName + " mining payout x" + newDays + " day" + (newDays > 1 ? "s" : ""), refId: id, createdAt: now,
      };
      tx.set(db().collection("transactions").doc(), e);
    }
    tx.update(ref, {
      settledDays: days,
      paidUsd: round(c.paidUsd + usd, 2),
      paidAsset: round(c.paidAsset + assetAmount, 8),
      status: matured ? "completed" : "active",
    });
  });
}

/** Settles everything owed to one user. Called lazily when the user opens the app. */
export async function settleUser(uid: string) {
  const now = Date.now();
  const [invs, mines] = await Promise.all([
    db().collection("investments").where("uid", "==", uid).where("status", "==", "active").get(),
    db().collection("miningContracts").where("uid", "==", uid).where("status", "==", "active").get(),
  ]);
  const prices = mines.empty ? null : await getPrices();
  for (const d of invs.docs) await settleInvestment(d.id, now);
  for (const d of mines.docs) {
    const c = d.data() as MiningContractDoc;
    await settleMining(d.id, now, prices?.[c.minesAsset]?.usd ?? 0);
  }
}

/** Settles all active contracts platform-wide. Used by the cron endpoint and the admin panel. */
export async function settleAll() {
  const now = Date.now();
  const [invs, mines] = await Promise.all([
    db().collection("investments").where("status", "==", "active").get(),
    db().collection("miningContracts").where("status", "==", "active").get(),
  ]);
  const prices = mines.empty ? null : await getPrices();
  let n = 0;
  for (const d of invs.docs) { await settleInvestment(d.id, now); n++; }
  for (const d of mines.docs) {
    const c = d.data() as MiningContractDoc;
    await settleMining(d.id, now, prices?.[c.minesAsset]?.usd ?? 0);
    n++;
  }
  return n;
}
