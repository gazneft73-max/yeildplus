import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref.toUpperCase().slice(0, 16) : "";
  return (
    <AuthShell
      wide
      title="Create your account"
      subtitle="Takes about a minute. Verify your identity later to unlock withdrawals."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-brand-300 hover:text-brand-200 font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm initialRef={ref} />
    </AuthShell>
  );
}
