import { z } from "zod";
import { handle, ok, parseBody, requireAdmin } from "@/lib/server/api";
import { saveSettings } from "@/lib/server/settings";
import { ASSET_SYMBOLS } from "@/lib/types";

const schema = z.object({
  depositAddresses: z.record(z.enum(ASSET_SYMBOLS), z.object({ address: z.string().trim().max(128), network: z.string().trim().max(40), memo: z.string().trim().max(64).optional() })).optional(),
  minDeposit: z.number().nonnegative().optional(),
  minWithdrawal: z.number().nonnegative().optional(),
  withdrawalFeePercent: z.number().min(0).max(100).optional(),
  referralPercent: z.number().min(0).max(100).optional(),
  loanInterestPercent: z.number().min(0).max(500).optional(),
  maxLoanAmount: z.number().nonnegative().optional(),
  cardIssueFee: z.number().nonnegative().optional(),
  maintenanceMode: z.boolean().optional(),
  supportEmail: z.string().trim().email().optional(),
  announcement: z.string().trim().max(300).optional().or(z.literal("")),
});

export const POST = handle(async (req) => {
  await requireAdmin();
  const body = await parseBody(req, schema);
  await saveSettings(body);
  return ok({});
});
