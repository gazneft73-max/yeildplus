import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/server/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false, noarchive: true } };
export const dynamic = "force-dynamic";

/**
 * Hidden operations portal. It is never linked from the site and responds with the
 * ordinary 404 page unless the signed-in user is the configured admin (ADMIN_EMAIL or the
 * `admin` custom claim). Non-admins cannot tell the route exists.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();
  if (!session || !session.isAdmin) notFound();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
