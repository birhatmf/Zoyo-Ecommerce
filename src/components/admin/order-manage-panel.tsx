"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import {
  cancelOrderAction,
  updateOrderAction,
  updateOrderAdminNoteAction,
} from "@/app/admin/(panel)/orders/actions";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { allowedNextStatuses } from "@/lib/order-transitions";
import type { OrderStatus } from "@/generated/prisma/enums";

// Sipariş detayı yönetim paneli:
// - Durum değişimi: izinli geçişler; CANCELLED seçilirse iptal nedeni istenir.
// - Admin notu ayrı formda (durum değişiminden bağımsız).
export function OrderManagePanel({
  orderId,
  currentStatus,
  adminNote,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  adminNote: string | null;
}) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [cancelReason, setCancelReason] = useState("");
  const nextStatuses = allowedNextStatuses(currentStatus);
  const choosingCancel = selectedStatus === "CANCELLED";

  return (
    <div className="space-y-4">
      {/* Durum değişimi — CANCELLED iptal formuna yönlendirir */}
      <div className="rounded-md border border-border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="text-sm font-medium">Sipariş Yönetimi</h2>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Durum</span>
          {nextStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bu durumdan ileri gidilemez (terminal durum).
            </p>
          ) : (
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as OrderStatus);
                setCancelReason("");
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            >
              <option value={currentStatus} disabled>
                {ORDER_STATUS_LABELS[currentStatus]} (mevcut)
              </option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )}
        </label>

        {choosingCancel ? (
          <form action={cancelOrderAction} className="mt-3 space-y-3">
            <input type="hidden" name="orderId" value={orderId} />
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted-foreground">
                İptal Nedeni *
              </span>
              <textarea
                name="reason"
                rows={2}
                required
                minLength={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Müşteri vazgeçti, stok yok, vb."
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </label>
            <SubmitButton
              label="Siparişi İptal Et"
              disabled={cancelReason.trim().length < 3}
            />
          </form>
        ) : (
          <form action={updateOrderAction} className="mt-3">
            <input type="hidden" name="orderId" value={orderId} />
            <input type="hidden" name="status" value={selectedStatus} />
            <input type="hidden" name="adminNote" value="" />
            <SubmitButton
              label={selectedStatus !== currentStatus ? "Durumu Güncelle" : "Değişiklik Yok"}
              disabled={selectedStatus === currentStatus}
            />
          </form>
        )}
      </div>

      {/* Admin notu — ayrı form */}
      <form action={updateOrderAdminNoteAction} className="rounded-md border border-border bg-card p-5">
        <input type="hidden" name="orderId" value={orderId} />
        <h2 className="text-sm font-medium">Admin Notu</h2>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs text-muted-foreground">İç not</span>
          <textarea
            name="adminNote"
            rows={4}
            defaultValue={adminNote ?? ""}
            placeholder="Dahili not — müşteriye görünmez…"
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </label>
        <SubmitButton label="Notu Kaydet" />
      </form>
    </div>
  );
}

function SubmitButton({ label, disabled = false }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="mt-4 h-9 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
    >
      {pending ? "Kaydediliyor..." : label}
    </button>
  );
}
