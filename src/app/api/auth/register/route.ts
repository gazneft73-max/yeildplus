import { z } from "zod";
import { adminAuth, db } from "@/lib/server/firebase-admin";
import { handle, ok, parseBody, ApiError } from "@/lib/server/api";
import { randomCode } from "@/lib/utils";
import type { UserDoc } from "@/lib/types";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers and underscores"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(24),
  gender: z.enum(["male", "female", "other", "prefer_not"]),
  country: z.string().trim().min(2).max(64),
  currency: z.string().trim().min(3).max(3),
  accountType: z.enum(["personal", "business"]),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  referralCode: z.string().trim().max(16).optional().or(z.literal("")),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
});

/** Creates the Firebase Auth user and the Firestore profile atomically enough to be safe. */
export const POST = handle(async (req) => {
  const body = await parseBody(req, schema);
  const email = body.email.toLowerCase();
  const username = body.username.toLowerCase();

  const usernameTaken = await db().collection("users").where("username", "==", username).limit(1).get();
  if (!usernameTaken.empty) throw new ApiError("That username is already taken");

  let referredBy: string | null = null;
  if (body.referralCode) {
    const ref = await db().collection("users").where("referralCode", "==", body.referralCode.toUpperCase()).limit(1).get();
    if (ref.empty) throw new ApiError("Referral code not found");
    referredBy = ref.docs[0].id;
  }

  let uid: string;
  try {
    const u = await adminAuth().createUser({ email, password: body.password, displayName: body.fullName });
    uid = u.uid;
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "auth/email-already-exists") throw new ApiError("An account with this email already exists");
    if (code === "auth/invalid-password") throw new ApiError("Password is too weak");
    throw e;
  }

  // Ensure the referral code is unique.
  let referralCode = randomCode(8);
  for (let i = 0; i < 5; i++) {
    const clash = await db().collection("users").where("referralCode", "==", referralCode).limit(1).get();
    if (clash.empty) break;
    referralCode = randomCode(8);
  }

  const doc: UserDoc = {
    email,
    fullName: body.fullName,
    username,
    phone: body.phone,
    gender: body.gender,
    country: body.country,
    currency: body.currency.toUpperCase(),
    accountType: body.accountType,
    referralCode,
    referredBy,
    balances: { USDT: 0 },
    kycStatus: "none",
    status: "active",
    createdAt: Date.now(),
    totalDeposited: 0,
    totalWithdrawn: 0,
    referralEarnings: 0,
    referralPaid: false,
  };
  await db().collection("users").doc(uid).set(doc);
  return ok({ uid });
});
