"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { nextProductionStage, prevProductionStage } from "@/lib/order-production";
import { prisma } from "@/lib/prisma";

const orderIdSchema = z.object({ orderId: z.string().uuid() });

// Üretim hattına alır (QUEUED). Onaylanmış siparişler için önerilir.
export async function queueForProductionAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = orderIdSchema.safeParse({ orderId: formData.get("orderId") });
  if (!parsed.success) return;

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    select: { orderNumber: true, productionStage: true },
  });
  if (!order) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { productionStage: "QUEUED", lastEditedById: admin.id, lastEditedAt: new Date() },
  });
  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Order",
    entityId: parsed.data.orderId,
    summary: `${order.orderNumber} üretim sırasına alındı`,
    metadata: { productionStage: "QUEUED" },
  });
  revalidateProduction(parsed.data.orderId);
}

// Bir sonraki üretim aşamasına ilerletir.
export async function advanceProductionAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = orderIdSchema.safeParse({ orderId: formData.get("orderId") });
  if (!parsed.success) return;

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    select: { orderNumber: true, productionStage: true },
  });
  if (!order || !order.productionStage) return;

  const next = nextProductionStage(order.productionStage);
  if (!next) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { productionStage: next, lastEditedById: admin.id, lastEditedAt: new Date() },
  });
  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Order",
    entityId: parsed.data.orderId,
    summary: `${order.orderNumber} üretim aşaması: ${order.productionStage} → ${next}`,
    metadata: { from: order.productionStage, to: next },
  });
  revalidateProduction(parsed.data.orderId);
}

// Önceki üretim aşamasına geri alır (yanlış işaretleme düzeltmesi).
export async function regressProductionAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = orderIdSchema.safeParse({ orderId: formData.get("orderId") });
  if (!parsed.success) return;

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    select: { orderNumber: true, productionStage: true },
  });
  if (!order || !order.productionStage) return;

  const prev = prevProductionStage(order.productionStage);
  if (!prev) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { productionStage: prev, lastEditedById: admin.id, lastEditedAt: new Date() },
  });
  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Order",
    entityId: parsed.data.orderId,
    summary: `${order.orderNumber} üretim aşaması geri alındı: ${order.productionStage} → ${prev}`,
    metadata: { from: order.productionStage, to: prev },
  });
  revalidateProduction(parsed.data.orderId);
}

// Minder/döşeme checkbox'ı (UPHOLSTERY aşamasında anlamlı).
export async function toggleUpholsteryAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = orderIdSchema.safeParse({ orderId: formData.get("orderId") });
  if (!parsed.success) return;

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    select: { orderNumber: true, upholsteryDone: true },
  });
  if (!order) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { upholsteryDone: !order.upholsteryDone, lastEditedById: admin.id, lastEditedAt: new Date() },
  });
  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Order",
    entityId: parsed.data.orderId,
    summary: `${order.orderNumber} minder/döşeme ${!order.upholsteryDone ? "tamamlandı" : "işareti kaldırıldı"}`,
  });
  revalidateProduction(parsed.data.orderId);
}

// Üretim/sevk notu (örn. kargo no). Boşsa temizler.
export async function saveProductionNoteAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = z
    .object({
      orderId: z.string().uuid(),
      note: z.string().trim().max(1000),
    })
    .safeParse({
      orderId: formData.get("orderId"),
      note: formData.get("note") ?? "",
    });
  if (!parsed.success) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: {
      productionNote: parsed.data.note || null,
      lastEditedById: admin.id,
      lastEditedAt: new Date(),
    },
  });
  revalidateProduction(parsed.data.orderId);
}

function revalidateProduction(orderId: string) {
  revalidatePath("/admin/orders/production");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
