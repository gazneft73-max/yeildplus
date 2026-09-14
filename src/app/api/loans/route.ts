import { z } from "zod";
import { db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, requireActiveUser, ApiError } from "@/lib/server/api";
import { getSettings } from "@/lib/server/settings";
import { applyBalanceChange } from "@/lib/server/ledger";
import { round } from "@/lib/utils";
import type { LoanDoc } from "@/lib/types";

/** Apply for a loan. */
export const POST = handle(async (req) => {
  const { session, user } = await requireActiveUser();
  const body = await parseBody(
    req,
    z.object({
      amount: z.number().positive("Enter an amount"),
      durationMonths: z.number().int().min(1).max(24),
      purpose: z.string().trim().min(10, "Tell us a little more about the purpose").max(500),
    }),
  );
  if (user.kycStatus !== "approved") throw new ApiError("Complete identity verification (KYC) before applying for a loan");
  const settings = await getSettings();
  if (body.amount > settings.maxLoanAmount) throw new ApiError("Maximum loan amount is " + settings.maxLoanAmount + " USDT");
  const open = await db().collection("loans").where("uid", "==", session.uid).where("status", "in", ["pending", "approved"]).count().get();
  if (open.data().count > 0) throw new ApiError("You already have an open loan");

  const amount = round(body.amount, 2);
  const doc: LoanDoc = {
    uid: session.uid,
    userEmail: session.email,
    amount,
    durationMonths: body.durationMonths,
    interestPercent: settings.loanInterestPercent,
    purpose: body.purpose,
    totalRepayable: round(amount * (1 + settings.loanInterestPercent / 100), 2),
    repaid: 0,
    status: "pending",
    createdAt: Date.now(),
  };
  const ref = await db().collection("loans").add(doc);
  return ok({ id: ref.id });
});

/** Repay part or all of an approved loan from the USDT balance. */
export const PATCH = handle(async (req) => {
  const { session } = await requireActiveUser();
  const body = await parseBody(req, z.object({ loanId: z.string().min(1), amount: z.number().positive() }));
  const ref = db().collection("loans").doc(body.loanId);
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ApiError("Loan not found", 404);
    const loan = snap.data() as LoanDoc;
    if (loan.uid !== session.uid) throw new ApiError("Loan not found", 404);
    if (loan.status !== "approved") throw new ApiError("This loan is not open for repayment");
    const outstanding = round(loan.totalRepayable - loan.repaid, 2);
    const pay = round(Math.min(outstanding, body.amount), 2);
    await applyBalanceChange(tx, session.uid, "USDT", -pay, { type: "loan_repayment", note: "Loan repayment", refId: body.loanId });
    const repaid = round(loan.repaid + pay, 2);
    tx.update(ref, { repaid, status: repaid >= loan.totalRepayable - 0.005 ? "repaid" : "approved" });
  });
  return ok({});
});
