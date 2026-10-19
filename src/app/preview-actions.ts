"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { PREVIEW_COOKIE } from "@/lib/maintenance";

// Bakım modunda yöneticinin siteyi canlı önizlemesini sağlar.
export async function enableSitePreviewAction(): Promise<void> {
  await requireAdmin();
  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/");
}

export async function disableSitePreviewAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PREVIEW_COOKIE);
  redirect("/");
}
