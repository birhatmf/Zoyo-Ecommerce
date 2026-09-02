"use client";

import { useTransition } from "react";

import { logoutAction } from "@/app/admin/login/actions";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => logoutAction())}
      className={`mt-2 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50 ${
        compact ? "mt-0" : ""
      }`}
    >
      {isPending ? "Çıkılıyor..." : "Çıkış Yap"}
    </button>
  );
}
