import type { OrderStatus } from "@/generated/prisma/enums";

// Sipariş durumu görünüm sabitleri — client ve server ortak kullanır
// (server-only hiçbir bağımlılık içermez).

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "APPROVED",
  "PAYMENT_PENDING",
  "PAID",
  "IN_PRODUCTION",
  "READY",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Bekliyor",
  APPROVED: "Onaylandı",
  PAYMENT_PENDING: "Ödeme Bekleniyor",
  PAID: "Ödeme Alındı",
  IN_PRODUCTION: "Üretimde",
  READY: "Hazır",
  SHIPPED: "Gönderildi",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  PENDING: "bg-accent/10 text-accent border-accent/30",
  APPROVED: "bg-secondary text-secondary-foreground border-transparent",
  PAYMENT_PENDING: "bg-secondary text-secondary-foreground border-transparent",
  PAID: "bg-secondary text-secondary-foreground border-transparent",
  IN_PRODUCTION: "bg-secondary text-secondary-foreground border-transparent",
  READY: "bg-secondary text-secondary-foreground border-transparent",
  SHIPPED: "bg-secondary text-secondary-foreground border-transparent",
  COMPLETED: "bg-primary/10 text-primary border-transparent",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
