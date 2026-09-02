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

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
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
  });
  if (!parsed.success) {
    return { error: "E-posta ve şifre gereklidir." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  if (!admin || !admin.active || !(await compare(parsed.data.password, admin.passwordHash))) {
    recordFailedAttempt(rateKey);
    return { error: "E-posta veya şifre hatalı." };
  }

  clearAttempts(rateKey);
  await createSession(admin.id);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
