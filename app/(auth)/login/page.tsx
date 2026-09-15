import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/dashboard";
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your portfolio."
      footer={
        <>
          New to PlutoVest?{" "}
          <Link href="/register" className="text-brand-300 hover:text-brand-200 font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
