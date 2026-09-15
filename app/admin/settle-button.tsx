"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { api } from "@/lib/client-api";

export function SettleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const r = await api<{ settled: number }>("/api/admin/misc", { action: "settleAll" });
          toast.success(`Settled ${r.settled} contracts`);
          router.refresh();
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <RefreshCw className="size-4" /> Settle earnings now
    </Button>
  );
}
