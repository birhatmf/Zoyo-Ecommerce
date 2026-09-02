"use server";

import "server-only";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validatePasswordPolicy } from "@/lib/security/password";
import { generateTotpSecret, verifyTotp } from "@/lib/security/totp";

export type SecurityActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  totpSecret?: string;
  otpAuthUrl?: string;
};

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre zorunludur"),
  newPassword: z.string(),
  confirmPassword: z.string(),
});

// --- Şifre değiştirme ---

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function changePasswordAction(
  _previousState: SecurityActionState,
  formData: FormData,
): Promise<SecurityActionState> {
  const admin = await requireAdmin();

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      error: "Lütfen form alanlarını kontrol edin.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return { error: "Yeni şifreler eşleşmiyor" };
  }

  const policy = validatePasswordPolicy(parsed.data.newPassword);
  if (!policy.ok) {
    return { error: policy.reason };
  }

  const current = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: { passwordHash: true },
  });
  if (!current) return { error: "Hesap bulunamadı" };

  const ok = await compare(parsed.data.currentPassword, current.passwordHash);
  if (!ok) {
    return { error: "Mevcut şifre hatalı" };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await hash(parsed.data.newPassword, 12) },
  });
  return { success: "Şifre güncellendi" };
}

// --- 2FA (TOTP) ---

// Adım 1: secret üret, henüz etkinleştirme
export async function startTotpEnrollmentAction(): Promise<SecurityActionState> {
  const admin = await requireAdmin();
  const secret = generateTotpSecret();

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { totpSecret: secret, totpEnabled: false },
  });

  const otpAuthUrl = `otpauth://totp/${encodeURIComponent(`Zoyo:${admin.email}`)}?secret=${secret}&issuer=${encodeURIComponent("Zoyo")}&algorithm=SHA1&digits=6&period=30`;

  return { totpSecret: secret, otpAuthUrl };
}

// Adım 2: Kullanıcının girdiği kodu doğrula, TOTP'yi etkinleştir
export async function confirmTotpEnrollmentAction(
  _previousState: SecurityActionState,
  formData: FormData,
): Promise<SecurityActionState> {
  const admin = await requireAdmin();
  const code = z
    .string()
    .trim()
    .regex(/^\d{6}$/, "6 haneli kod giriniz")
    .safeParse(formData.get("code"));
  if (!code.success) {
    return { error: "Geçersiz kod formatı" };
  }

  const current = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: { totpSecret: true, totpEnabled: true },
  });
  if (!current?.totpSecret) {
    return { error: "Önce 2FA kurulumunu başlatın" };
  }
  if (!verifyTotp(code.data, current.totpSecret)) {
    return { error: "Kod doğrulanamadı. Tekrar deneyin." };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { totpEnabled: true, totpVerifiedAt: new Date() },
  });
  revalidatePath("/admin/settings/security");
  return { success: "2FA etkinleştirildi" };
}

// 2FA'yı devre dışı bırakmak için mevcut şifre + TOTP kodu istenir.
// Plain server action — form tarafında redirect/revalidate kullanılır.
export async function disableTotpAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "");

  const current = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: { passwordHash: true, totpSecret: true },
  });
  if (!current) return;

  const passwordOk = await compare(password, current.passwordHash);
  const totpOk = current.totpSecret ? verifyTotp(code, current.totpSecret) : false;
  if (!passwordOk || !totpOk) return;

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { totpSecret: null, totpEnabled: false, totpVerifiedAt: null },
  });
  revalidatePath("/admin/settings/security");
}
