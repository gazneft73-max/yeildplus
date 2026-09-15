import "server-only";
import { cache } from "react";
import { db } from "./firebase-admin";
import type { InvestmentPlanDoc, MiningPlanDoc, WithId } from "../types";

function sortPlans<T extends { sortOrder: number; createdAt: number }>(a: T, b: T) {
  return a.sortOrder - b.sortOrder || a.createdAt - b.createdAt;
}

/** Active plans for public pages and the user dashboard. Tolerates a missing Firebase config on first boot. */
export const getPublicPlans = cache(async () => {
  try {
    const [inv, mine] = await Promise.all([
      db().collection("investmentPlans").where("active", "==", true).get(),
      db().collection("miningPlans").where("active", "==", true).get(),
    ]);
    const invest = inv.docs.map((d) => ({ id: d.id, ...(d.data() as InvestmentPlanDoc) })).sort(sortPlans);
    const mining = mine.docs.map((d) => ({ id: d.id, ...(d.data() as MiningPlanDoc) })).sort(sortPlans);
    return {
      investing: invest.filter((p) => (p.category ?? "investing") === "investing"),
      realEstate: invest.filter((p) => p.category === "real_estate"),
      mining,
    };
  } catch (e) {
    console.error("[plans] failed to load", (e as Error).message);
    return { investing: [] as WithId<InvestmentPlanDoc>[], realEstate: [] as WithId<InvestmentPlanDoc>[], mining: [] as WithId<MiningPlanDoc>[] };
  }
});

/** All plans, including inactive, for the admin portal. */
export async function getAllPlans() {
  const [inv, mine] = await Promise.all([db().collection("investmentPlans").get(), db().collection("miningPlans").get()]);
  return {
    investment: inv.docs.map((d) => ({ id: d.id, ...(d.data() as InvestmentPlanDoc) })).sort(sortPlans),
    mining: mine.docs.map((d) => ({ id: d.id, ...(d.data() as MiningPlanDoc) })).sort(sortPlans),
  };
}
