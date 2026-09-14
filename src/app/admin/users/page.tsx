import Link from "next/link";
import { db } from "@/lib/server/firebase-admin";
import type { UserDoc, WithId } from "@/lib/types";
import { PageHeader } from "@/components/app/shell";
import { Card, Badge, statusTone, Table, Th, Td, Empty } from "@/components/ui";
import { SearchBox } from "./search-box";
import { fmtDate, fmtUsd } from "@/lib/utils";

export default async function AdminUsers({ searchParams }: PageProps<"/admin/users">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  let rows: WithId<UserDoc>[];
  if (q) {
    const [byEmail, byUsername] = await Promise.all([
      db().collection("users").where("email", "==", q).limit(20).get(),
      db().collection("users").where("username", "==", q).limit(20).get(),
    ]);
    const seen = new Set<string>();
    rows = [...byEmail.docs, ...byUsername.docs].filter((d) => !seen.has(d.id) && seen.add(d.id)).map((d) => ({ id: d.id, ...(d.data() as UserDoc) }));
  } else {
    const snap = await db().collection("users").orderBy("createdAt", "desc").limit(100).get();
    rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserDoc) }));
  }
  return (
    <>
      <PageHeader title="Users" text="Search by exact email or username." action={<SearchBox initial={q} />} />
      <Card>
        {rows.length === 0 ? (
          <Empty title="No users found" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Member</Th>
                <Th>Country</Th>
                <Th className="text-right">USDT</Th>
                <Th className="text-right">Deposited</Th>
                <Th>KYC</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-white/3">
                  <Td>
                    <Link href={`/admin/users/${u.id}`} className="text-white font-medium hover:text-brand-300">{u.fullName}</Link>
                    <p className="text-xs text-ink-400">{u.email} · @{u.username}</p>
                  </Td>
                  <Td>{u.country}</Td>
                  <Td className="text-right tabular-nums">{fmtUsd(u.balances?.USDT ?? 0)}</Td>
                  <Td className="text-right tabular-nums">{fmtUsd(u.totalDeposited ?? 0)}</Td>
                  <Td><Badge tone={statusTone(u.kycStatus === "none" ? "" : u.kycStatus)}>{u.kycStatus}</Badge></Td>
                  <Td><Badge tone={statusTone(u.status)}>{u.status}</Badge></Td>
                  <Td>{fmtDate(u.createdAt, false)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
