import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireAdmin } from "@/lib/server/api";
import { MINING_ASSETS } from "@/lib/types";

const investmentPlan = z.object({
  kind: z.literal("investment"),
  id: z.string().optional(),
  name: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(120).optional().or(z.literal("")),
  category: z.enum(["investing", "real_estate"]),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  minAmount: z.number().nonnegative(),
  maxAmount: z.number().nonnegative(),
  roiPercent: z.number().positive(),
  durationDays: z.number().int().positive(),
  payout: z.enum(["daily", "end"]),
  capitalBack: z.boolean(),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int(),
});

const miningPlan = z.object({
  kind: z.literal("mining"),
  id: z.string().optional(),
  name: z.string().trim().min(2).max(60),
  hashrate: z.string().trim().min(1).max(40),
  algorithm: z.string().trim().min(1).max(40),
  minesAsset: z.enum(MINING_ASSETS),
  price: z.number().positive(),
  durationDays: z.number().int().positive(),
  dailyReturnPercent: z.number().positive(),
  maintenanceFeePercent: z.number().min(0).max(100),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int(),
});

export const POST = handle(async (req) => {
  await requireAdmin();
  const body = await parseBody(req, z.discriminatedUnion("kind", [investmentPlan, miningPlan]));
  const { kind, id, ...data } = body;
  const col = db().collection(kind === "investment" ? "investmentPlans" : "miningPlans");
  if (id) {
    await col.doc(id).set(data, { merge: true });
    return ok({ id });
  }
  const ref = await col.add({ ...data, createdAt: Date.now() });
  return ok({ id: ref.id });
});

export const DELETE = handle(async (req) => {
  await requireAdmin();
  const { kind, id } = await parseBody(req, z.object({ kind: z.enum(["investment", "mining"]), id: z.string().min(1) }));
  await db().collection(kind === "investment" ? "investmentPlans" : "miningPlans").doc(id).delete();
  return ok({});
});
