import "server-only";
import { db } from "./firebase-admin";
import type { WithId } from "../types";

/** Reads a collection ordered by createdAt desc with optional equality filters. */
export async function list<T>(
  collection: string,
  opts: { where?: [string, FirebaseFirestore.WhereFilterOp, unknown][]; limit?: number; orderBy?: string } = {},
): Promise<WithId<T>[]> {
  let q: FirebaseFirestore.Query = db().collection(collection);
  for (const [f, op, v] of opts.where ?? []) q = q.where(f, op, v);
  q = q.orderBy(opts.orderBy ?? "createdAt", "desc").limit(opts.limit ?? 50);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}

export async function getDoc<T>(collection: string, id: string): Promise<WithId<T> | null> {
  const snap = await db().collection(collection).doc(id).get();
  return snap.exists ? { id: snap.id, ...(snap.data() as T) } : null;
}

export async function count(collection: string, where: [string, FirebaseFirestore.WhereFilterOp, unknown][] = []) {
  let q: FirebaseFirestore.Query = db().collection(collection);
  for (const [f, op, v] of where) q = q.where(f, op, v);
  const snap = await q.count().get();
  return snap.data().count;
}
