"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { quickStatusUpdateAction } from "@/app/admin/(panel)/orders/actions";
import { ORDER_STATUS_BADGE_CLASSES, ORDER_STATUS_LABELS } from "@/lib/order-status";
import { allowedNextStatuses } from "@/lib/order-transitions";
import type { OrderStatus } from "@/generated/prisma/enums";

// Liste satırındaki hızlı durum değiştirici.
// Yalnızca izinli bir sonraki duruma geçiş yapılır (iptal detay sayfasında).
export function OrderStatusInlineSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const next = allowedNextStatuses(status);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const target = e.target.value as OrderStatus;
    if (target === status || pending) return;
    setPending(true);
    const fd = new FormData();
    fd.set("orderId", orderId);
    fd.set("status", target);
    try {
      await quickStatusUpdateAction(fd);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {pending && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
      {next.length === 0 ? (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${ORDER_STATUS_BADGE_CLASSES[status]}`}>
          {ORDER_STATUS_LABELS[status]}
        </span>
      ) : (
        <select
          value={status}
          onChange={handleChange}
          disabled={pending}
          aria-label={`${ORDER_STATUS_LABELS[status]} durumunu değiştir`}
          className={`h-7 cursor-pointer rounded-full border px-2 py-0.5 text-xs outline-none transition-colors focus:ring-2 focus:ring-ring/40 disabled:opacity-50 ${ORDER_STATUS_BADGE_CLASSES[status]}`}
        >
          <option value={status}>{ORDER_STATUS_LABELS[status]}</option>
          {next.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]} →
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
