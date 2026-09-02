"use client";

import { useSyncExternalStore } from "react";

import { useCartCount } from "@/lib/cart";

const emptySubscribe = () => () => {};

export function CartBadge() {
  // localStorage yalnızca mount sonrası okunur → hidrasyon uyumsuzluğu olmaz
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const count = useCartCount();

  if (!mounted || count === 0) return null;

  return (
    <span
      aria-hidden="true"
      className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] leading-none font-medium text-accent-foreground"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
