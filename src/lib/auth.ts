import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "zoyo_admin_session";
const SESSION_DAYS = 7;

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set (min 32 chars)");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(adminId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ sub: adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionAdminId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// Server-side authorization: hem oturum geçerli hem admin hesabı aktif olmalı.
export async function requireAdmin() {
  const adminId = await getSessionAdminId();
  if (!adminId) redirect("/admin/login");

  const admin = await prisma.adminUser.findFirst({
    where: { id: adminId, active: true },
    select: { id: true, name: true, email: true },
  });
  if (!admin) redirect("/admin/login");

  return admin;
}
