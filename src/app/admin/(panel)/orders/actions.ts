"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { canTransition } from "@/lib/order-transitions";
import { prisma } from "@/lib/prisma";
import {
  orderStatusUpdateSchema,
  trPhoneSchema,
} from "@/validations/order";

const updateOrderSchema = z.object({
  orderId: z.string().uuid(),
  status: orderStatusUpdateSchema.shape.status,
  adminNote: z.string().trim().max(2000).optional().or(z.literal("")),
});

const contactUpdateSchema = z.object({
  orderId: z.string().uuid(),
  customerFirstName: z.string().trim().min(2, "Ad en az 2 karakter olmalıdır").max(100),
  customerLastName: z.string().trim().min(2, "Soyad en az 2 karakter olmalıdır").max(100),
  phone: trPhoneSchema,
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta giriniz")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().min(2, "İl giriniz").max(100),
  district: z.string().trim().min(2, "İlçe giriniz").max(100),
  address: z.string().trim().min(10, "Adres en az 10 karakter olmalıdır").max(1000),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Posta kodu 5 haneli olmalıdır")
    .optional()
    .or(z.literal("")),
});

export async function updateOrderContactAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = contactUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    customerFirstName: formData.get("customerFirstName"),
    customerLastName: formData.get("customerLastName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    city: formData.get("city"),
    district: formData.get("district"),
    address: formData.get("address"),
    postalCode: formData.get("postalCode") ?? "",
  });
  if (!parsed.success) return;

  const { orderId, postalCode, email, phone, ...rest } = parsed.data;

  // Hem phone hem phoneNormalized aynı normalize değerle güncellenir —
  // aksi halde iki alan birbirinden kopar (tutarsızlık).
  await prisma.order.update({
    where: { id: orderId },
    data: {
      ...rest,
      phone,
      phoneNormalized: phone,
      email: email || null,
      postalCode: postalCode || null,
      lastEditedById: admin.id,
      lastEditedAt: new Date(),
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
}

const createNoteSchema = z.object({
  orderId: z.string().uuid(),
  content: z.string().trim().min(1, "Not boş olamaz").max(1000),
});

const noteIdSchema = z.object({
  noteId: z.string().uuid(),
});

export async function updateOrderAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = updateOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    adminNote: formData.get("adminNote") ?? "",
  });
  if (!parsed.success) return;

  const { orderId, status, adminNote } = parsed.data;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderNumber: true, status: true },
  });
  if (!existing) return;

  // Geçersiz durum geçişini reddet (PRD §25 + order-transitions.ts).
  if (!canTransition(existing.status, status)) {
    return;
  }

  // CANCELLED'a geçerken iptal nedeni zorunlu — adminNote içine yazılır.
  if (status === "CANCELLED" && !adminNote) {
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      adminNote: adminNote || null,
      lastEditedById: admin.id,
      lastEditedAt: new Date(),
    },
  });

  await recordAudit({
    actor: admin,
    action: existing.status !== status ? "STATUS_CHANGE" : "UPDATE",
    entityType: "Order",
    entityId: orderId,
    summary:
      existing.status !== status
        ? `${existing.orderNumber} durumu ${existing.status} → ${status}`
        : `${existing.orderNumber} güncellendi`,
    metadata: { from: existing.status, to: status },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

// Liste satırından hızlı durum değişimi — adminNote'a dokunmaz.
export async function quickStatusUpdateAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = z
    .object({
      orderId: z.string().uuid(),
      status: orderStatusUpdateSchema.shape.status,
    })
    .safeParse({
      orderId: formData.get("orderId"),
      status: formData.get("status"),
    });
  if (!parsed.success) return;

  const { orderId, status } = parsed.data;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderNumber: true, status: true },
  });
  if (!existing) return;
  if (!canTransition(existing.status, status)) return;
  // Listedeki hızlı değişimde iptal neden detay sayfasından istenir.
  if (status === "CANCELLED") return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status, lastEditedById: admin.id, lastEditedAt: new Date() },
  });
  await recordAudit({
    actor: admin,
    action: "STATUS_CHANGE",
    entityType: "Order",
    entityId: orderId,
    summary: `${existing.orderNumber} durumu ${existing.status} → ${status} (hızlı)`,
    metadata: { from: existing.status, to: status, quick: true },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

// İptal: nedeni adminNote'a "İptal nedeni: ..." olarak yazar.
export async function cancelOrderAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = z
    .object({
      orderId: z.string().uuid(),
      reason: z.string().trim().min(3, "İptal nedeni giriniz").max(1000),
    })
    .safeParse({
      orderId: formData.get("orderId"),
      reason: formData.get("reason"),
    });
  if (!parsed.success) return;

  const { orderId, reason } = parsed.data;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderNumber: true, status: true, adminNote: true },
  });
  if (!existing) return;
  if (!canTransition(existing.status, "CANCELLED")) return;

  const note = `İptal nedeni: ${reason}`;
  const adminNote = existing.adminNote
    ? `${existing.adminNote}\n${note}`
    : note;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED", adminNote, lastEditedById: admin.id, lastEditedAt: new Date() },
  });
  await recordAudit({
    actor: admin,
    action: "STATUS_CHANGE",
    entityType: "Order",
    entityId: orderId,
    summary: `${existing.orderNumber} iptal edildi: ${reason}`,
    metadata: { from: existing.status, to: "CANCELLED", reason },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

// Yalnızca admin notunu kaydeder (durumdan bağımsız).
export async function updateOrderAdminNoteAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = z
    .object({
      orderId: z.string().uuid(),
      adminNote: z.string().trim().max(2000),
    })
    .safeParse({
      orderId: formData.get("orderId"),
      adminNote: formData.get("adminNote") ?? "",
    });
  if (!parsed.success) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: {
      adminNote: parsed.data.adminNote || null,
      lastEditedById: admin.id,
      lastEditedAt: new Date(),
    },
  });
  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Order",
    entityId: parsed.data.orderId,
    summary: "Admin notu güncellendi",
  });
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/orders");
}

export async function addOrderNoteAction(formData: FormData): Promise<void> {
  const actor = await requireRole("EDITOR");
  if (!actor) return;

  const parsed = createNoteSchema.safeParse({
    orderId: formData.get("orderId"),
    content: formData.get("content"),
  });
  if (!parsed.success) return;

  const last = await prisma.orderNote.findFirst({
    where: { orderId: parsed.data.orderId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.orderNote.create({
    data: {
      orderId: parsed.data.orderId,
      content: parsed.data.content,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
}

export async function toggleOrderNoteAction(formData: FormData): Promise<void> {
  const actor = await requireRole("EDITOR");
  if (!actor) return;

  const parsed = noteIdSchema.safeParse({ noteId: formData.get("noteId") });
  if (!parsed.success) return;

  const note = await prisma.orderNote.findUnique({
    where: { id: parsed.data.noteId },
    select: { id: true, done: true, orderId: true },
  });
  if (!note) return;

  await prisma.orderNote.update({
    where: { id: note.id },
    data: { done: !note.done },
  });

  revalidatePath(`/admin/orders/${note.orderId}`);
}

export async function updateOrderNoteAction(formData: FormData): Promise<void> {
  const actor = await requireRole("EDITOR");
  if (!actor) return;

  const parsed = z
    .object({
      noteId: z.string().uuid(),
      content: z.string().trim().min(1).max(1000),
    })
    .safeParse({
      noteId: formData.get("noteId"),
      content: formData.get("content"),
    });
  if (!parsed.success) return;

  const note = await prisma.orderNote.findUnique({
    where: { id: parsed.data.noteId },
    select: { orderId: true },
  });
  if (!note) return;

  await prisma.orderNote.update({
    where: { id: parsed.data.noteId },
    data: { content: parsed.data.content },
  });

  revalidatePath(`/admin/orders/${note.orderId}`);
}

export async function deleteOrderNoteAction(formData: FormData): Promise<void> {
  const actor = await requireRole("EDITOR");
  if (!actor) return;

  const parsed = noteIdSchema.safeParse({ noteId: formData.get("noteId") });
  if (!parsed.success) return;

  const note = await prisma.orderNote.findUnique({
    where: { id: parsed.data.noteId },
    select: { orderId: true },
  });
  if (!note) return;

  await prisma.orderNote.delete({ where: { id: parsed.data.noteId } });

  revalidatePath(`/admin/orders/${note.orderId}`);
}
