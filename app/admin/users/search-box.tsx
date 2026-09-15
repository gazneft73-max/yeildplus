"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui";

export function SearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q ? `/admin/users?q=${encodeURIComponent(q.trim())}` : "/admin/users");
      }}
    >
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="email or username" className="w-64" />
    </form>
  );
}
