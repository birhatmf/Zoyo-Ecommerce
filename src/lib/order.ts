import type { OrderStatus } from "@/generated/prisma/enums";

import { getSiteSettings } from "@/lib/settings";

export const ORDER_NOTE_TEMPLATES_KEY = "orderNoteTemplates";

export async function getOrderNoteTemplates(): Promise<string[]> {
  const settings = await getSiteSettings();
  const raw = settings[ORDER_NOTE_TEMPLATES_KEY];
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) =>
        typeof item === "string"
          ? item
          : item && typeof item === "object" && typeof (item as { content?: unknown }).content === "string"
            ? ((item as { content: string }).content)
            : null,
      )
      .filter((item): item is string => item !== null && item.trim().length > 0);
  } catch {
    return [];
  }
}

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

export type OrderNoteTemplateItem = { id: string; content: string };

export async function getOrderNoteTemplatesWithIds(): Promise<OrderNoteTemplateItem[]> {
  const settings = await getSiteSettings();
  const raw = settings[ORDER_NOTE_TEMPLATES_KEY];
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is OrderNoteTemplateItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as OrderNoteTemplateItem).id === "string" &&
        typeof (item as OrderNoteTemplateItem).content === "string",
    );
  } catch {
    return [];
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
