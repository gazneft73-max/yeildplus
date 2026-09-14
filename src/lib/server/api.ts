import "server-only";
import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { getSession, type SessionUser } from "./session";
import { db } from "./firebase-admin";
import type { UserDoc } from "../types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json({ ok: true, ...data }, init);

export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (e) {
      const err = e as Partial<ApiError>;
      const status = typeof err.status === "number" ? err.status : 500;
      const message = err.message || "Something went wrong";
      if (status >= 500) console.error("[api]", e);
      return NextResponse.json({ ok: false, error: message }, { status });
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError("Invalid JSON body");
  }
  const r = schema.safeParse(json);
  if (!r.success) throw new ApiError(r.error.issues[0]?.message || "Invalid input");
  return r.data;
}

export async function requireUser(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) throw new ApiError("Please sign in", 401);
  return s;
}

export async function requireActiveUser(): Promise<{ session: SessionUser; user: UserDoc }> {
  const session = await requireUser();
  const snap = await db().collection("users").doc(session.uid).get();
  if (!snap.exists) throw new ApiError("Account not found", 404);
  const user = snap.data() as UserDoc;
  if (user.status === "suspended") throw new ApiError("Your account is suspended. Contact support.", 403);
  return { session, user };
}

export async function requireAdmin(): Promise<SessionUser> {
  const s = await getSession();
  // Non-admins get a 404 so the portal does not reveal itself.
  if (!s || !s.isAdmin) throw new ApiError("Not found", 404);
  return s;
}
