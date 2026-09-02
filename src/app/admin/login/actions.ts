"use server";

import "server-only";

import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  clearAttempts,
  getClientIp,
  isRateLimited,
  recordFailedAttempt,
} from "@/lib/rate-limit";
import { verifyTotp } from "@/lib/security/totp";

// Hesap kilitleme eşiği: 10 ardışık başarısız deneme sonrası 15 dk kilitli.
const MAX_FAILED_LOGINS = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  totp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "TOTP kodu 6 haneli olmalıdır")
    .optional()
    .or(z.literal("")),
});

export async function loginAction(
  _previousState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const headerList = await headers();
  const ip = getClientIp(headerList);
  const rateKey = `login:${ip}`;
  if (isRateLimited(rateKey)) {
    return { error: "Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    totp: formData.get("totp") ?? "",
  });
  if (!parsed.success) {
    return { error: "E-posta ve şifre gereklidir." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  // Kullanıcı var mı / aktif mi / kilitli mi kontrolü
  if (!admin || !admin.active) {
    recordFailedAttempt(rateKey);
    return { error: "E-posta veya şifre hatalı." };
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    return {
      error: "Hesap geçici olarak kilitli. Lütfen birkaç dakika sonra tekrar deneyin.",
    };
  }

  const passwordOk = await compare(parsed.data.password, admin.passwordHash);
  if (!passwordOk) {
    recordFailedAttempt(rateKey);
    await incrementFailedLogin(admin.id);
    return { error: "E-posta veya şifre hatalı." };
  }

  // TOTP doğrulaması — hesap için 2FA etkinse zorunlu
  if (admin.totpEnabled) {
    if (!admin.totpSecret) {
      // Tutarsız durum: enabled=true ama secret yok → 2FA'yı devre dışı bırak
      // ve audit için logla. Giriş reddedilir; admin secret'ı yeniden üretmeli.
      return {
        error:
          "Hesabınız için 2FA yapılandırması bozuk. Yönetici ile iletişime geçin.",
      };
    }
    const totpOk = verifyTotp(parsed.data.totp ?? "", admin.totpSecret);
    if (!totpOk) {
      recordFailedAttempt(rateKey);
      await incrementFailedLogin(admin.id);
      return { error: "TOTP kodu hatalı veya eksik." };
    }
  }

  // Başarılı giriş: sayaçları sıfırla
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });
  clearAttempts(rateKey);
  await createSession(admin.id);
  redirect("/admin");
}

async function incrementFailedLogin(adminId: string): Promise<void> {
  const current = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { failedLoginCount: true },
  });
  if (!current) return;
  const nextCount = current.failedLoginCount + 1;
  await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      failedLoginCount: nextCount,
      lockedUntil:
        nextCount >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
    },
  });
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
