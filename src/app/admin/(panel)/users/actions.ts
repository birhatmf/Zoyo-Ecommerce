"use server";

import "server-only";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { validatePasswordPolicy } from "@/lib/security/password";

export type UserActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  saved?: boolean;
};

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmalıdır").max(100),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta giriniz"),
  password: z.string(),
  role: z.enum(["ADMIN", "EDITOR"]),
});

const toggleSchema = z.object({
  id: z.string().uuid(),
});

const roleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["ADMIN", "EDITOR"]),
});

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createAdminUserAction(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const actor = await requireRole("ADMIN");
  if (!actor) return { error: "Bu işlem için yetkiniz yok." };

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "EDITOR",
  });
  if (!parsed.success) {
    return {
      error: "Lütfen form alanlarını kontrol edin.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const policy = validatePasswordPolicy(parsed.data.password);
  if (!policy.ok) {
    return { error: policy.reason, fieldErrors: { password: policy.reason } };
  }

  try {
    const created = await prisma.adminUser.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hash(parsed.data.password, 12),
        role: parsed.data.role,
      },
    });
    await recordAudit({
      actor,
      action: "CREATE",
      entityType: "AdminUser",
      entityId: created.id,
      summary: `${created.name} (${created.email}) admin kullanıcısı oluşturuldu`,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("admin_users_email_key")) {
      return { error: "Bu e-posta zaten kullanılıyor." };
    }
    console.error("Admin user create failed:", error);
    return { error: "Kullanıcı oluşturulamadı." };
  }

  revalidatePath("/admin/users");
  return { saved: true };
}

export async function toggleAdminUserAction(formData: FormData): Promise<void> {
  const actor = await requireRole("ADMIN");
  if (!actor) return;

  const parsed = toggleSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;

  // Kendini devre dışı bırakma / silme koruması
  if (parsed.data.id === actor.id) return;

  const existing = await prisma.adminUser.findUnique({
    where: { id: parsed.data.id },
    select: { active: true, name: true, email: true },
  });
  if (!existing) return;

  await prisma.adminUser.update({
    where: { id: parsed.data.id },
    data: { active: !existing.active },
  });
  await recordAudit({
    actor,
    action: existing.active ? "DISABLE" : "ENABLE",
    entityType: "AdminUser",
    entityId: parsed.data.id,
    summary: `${existing.name} (${existing.email}) ${existing.active ? "devre dışı bırakıldı" : "etkinleştirildi"}`,
  });
  revalidatePath("/admin/users");
}

export async function updateAdminUserRoleAction(formData: FormData): Promise<void> {
  const actor = await requireRole("ADMIN");
  if (!actor) return;

  const parsed = roleSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });
  if (!parsed.success) return;

  // Kendi rolünü düşürme koruması (kilitlenme önlemi)
  if (parsed.data.id === actor.id && parsed.data.role !== "ADMIN") return;

  const existing = await prisma.adminUser.findUnique({
    where: { id: parsed.data.id },
    select: { name: true, email: true, role: true },
  });
  if (!existing) return;

  await prisma.adminUser.update({
    where: { id: parsed.data.id },
    data: { role: parsed.data.role },
  });
  await recordAudit({
    actor,
    action: "UPDATE",
    entityType: "AdminUser",
    entityId: parsed.data.id,
    summary: `${existing.name} rolü ${existing.role} → ${parsed.data.role}`,
  });
  revalidatePath("/admin/users");
}
