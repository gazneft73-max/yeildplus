import { NextResponse } from "next/server";
import { settleAll } from "@/lib/server/settle";

/**
 * Settles all active investments and mining contracts. Point a scheduler (Vercel Cron,
 * cron-job.org, etc.) at GET /api/cron/settle with `Authorization: Bearer $CRON_SECRET`.
 * Earnings are also settled lazily whenever a user opens their dashboard, so this is a safety net.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== "Bearer " + secret) return NextResponse.json({ ok: false }, { status: 401 });
  const n = await settleAll();
  return NextResponse.json({ ok: true, settled: n });
}
