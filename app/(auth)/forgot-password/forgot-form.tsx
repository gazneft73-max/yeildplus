"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input } from "@/components/ui";
import { requestPasswordReset } from "@/lib/auth-client";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-mint-500/30 bg-mint-500/10 p-4 text-sm text-mint-300">
        If an account exists for <span className="font-medium text-white">{email}</span>, a reset link is on its way. Check your inbox and spam folder.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Email">
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>
      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Send reset link
      </Button>
    </form>
  );
}
