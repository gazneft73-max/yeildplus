"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input, Select } from "@/components/ui";
import { api } from "@/lib/client-api";
import { loginWithPassword } from "@/lib/auth-client";
import { COUNTRIES, CURRENCIES } from "@/lib/countries";

export function RegisterForm({ initialRef }: { initialRef: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    gender: "male",
    country: "",
    currency: "USD",
    accountType: "personal",
    password: "",
    confirm: "",
    referralCode: initialRef,
    acceptTerms: false,
  });
  // Simple arithmetic check to discourage bots without a third-party captcha.
  const [[a, b], setChallenge] = useState<[number, number]>([4, 3]);
  useEffect(() => {
    // Randomised after mount on purpose so the challenge is not baked into the server-rendered HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChallenge([Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 8) + 1]);
  }, []);
  const [check, setCheck] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.password !== f.confirm) return toast.error("Passwords do not match");
    if (Number(check) !== a + b) return toast.error("Security check answer is wrong");
    if (!f.acceptTerms) return toast.error("Please accept the terms to continue");
    setLoading(true);
    try {
      const { confirm: _c, ...payload } = f;
      void _c;
      await api("/api/auth/register", payload);
      await loginWithPassword(f.email, f.password);
      toast.success("Welcome to PlutoVest");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name">
        <Input required value={f.fullName} onChange={set("fullName")} placeholder="Jane Doe" autoComplete="name" />
      </Field>
      <Field label="Username">
        <Input required value={f.username} onChange={set("username")} placeholder="janedoe" autoComplete="username" />
      </Field>
      <Field label="Email">
        <Input type="email" required value={f.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field label="Phone">
        <Input type="tel" required value={f.phone} onChange={set("phone")} placeholder="+1 555 000 0000" autoComplete="tel" />
      </Field>
      <Field label="Gender">
        <Select value={f.gender} onChange={set("gender")}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not">Prefer not to say</option>
        </Select>
      </Field>
      <Field label="Country">
        <Select required value={f.country} onChange={set("country")}>
          <option value="" disabled>
            Select country
          </option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Preferred currency">
        <Select value={f.currency} onChange={set("currency")}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Account type">
        <Select value={f.accountType} onChange={set("accountType")}>
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </Select>
      </Field>
      <Field label="Password" hint="min. 8 characters">
        <Input type="password" required minLength={8} value={f.password} onChange={set("password")} autoComplete="new-password" placeholder="••••••••" />
      </Field>
      <Field label="Confirm password">
        <Input type="password" required minLength={8} value={f.confirm} onChange={set("confirm")} autoComplete="new-password" placeholder="••••••••" />
      </Field>
      <Field label="Referral code" hint="optional">
        <Input value={f.referralCode} onChange={set("referralCode")} placeholder="ABCD1234" className="uppercase" />
      </Field>
      <Field label="Security check" hint={`What is ${a} + ${b}?`}>
        <Input inputMode="numeric" required value={check} onChange={(e) => setCheck(e.target.value)} placeholder="Answer" />
      </Field>
      <label className="sm:col-span-2 flex items-start gap-3 text-sm text-ink-300 cursor-pointer">
        <input type="checkbox" checked={f.acceptTerms} onChange={set("acceptTerms")} className="mt-0.5 size-4 accent-brand-500" />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-brand-300 hover:text-brand-200">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand-300 hover:text-brand-200">
            Privacy Policy
          </Link>
          , and confirm I am at least 18 years old.
        </span>
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
        </Button>
      </div>
    </form>
  );
}
