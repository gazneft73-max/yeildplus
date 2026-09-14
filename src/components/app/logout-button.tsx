"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { logout } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await logout();
        router.replace("/login");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
