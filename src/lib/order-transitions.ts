import type { OrderStatus } from "@/generated/prisma/enums";

// Sipariş durum geçiş kuralları tek noktada tutulur (PRD §25).
// İzinsiz geçişler reddedilir; aynı duruma geçiş no-op kabul edilir.
//
// Kurallar:
// - PENDING → APPROVED, CANCELLED
// - APPROVED → PAYMENT_PENDING, IN_PRODUCTION, CANCELLED
// - PAYMENT_PENDING → PAID, CANCELLED
// - PAID → IN_PRODUCTION, CANCELLED
// - IN_PRODUCTION → READY, CANCELLED
// - READY → SHIPPED, CANCELLED
// - SHIPPED → COMPLETED
// - COMPLETED → (terminal)
// - CANCELLED → (terminal)
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["APPROVED", "CANCELLED"],
  APPROVED: ["PAYMENT_PENDING", "IN_PRODUCTION", "CANCELLED"],
  PAYMENT_PENDING: ["PAID", "CANCELLED"],
  PAID: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["READY", "CANCELLED"],
  READY: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return ALLOWED_ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function allowedNextStatuses(from: OrderStatus): OrderStatus[] {
  return ALLOWED_ORDER_TRANSITIONS[from] ?? [];
}
