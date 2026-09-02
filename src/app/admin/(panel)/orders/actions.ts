"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
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
  await requireAdmin();

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

  const { orderId, postalCode, email, ...rest } = parsed.data;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      ...rest,
      phoneNormalized: rest.phone,
      email: email || null,
      postalCode: postalCode || null,
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
  await requireAdmin();

  const parsed = updateOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    adminNote: formData.get("adminNote") ?? "",
  });
  if (!parsed.success) return;

  const { orderId, status, adminNote } = parsed.data;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      adminNote: adminNote || null,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function addOrderNoteAction(formData: FormData): Promise<void> {
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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
  await requireAdmin();

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
