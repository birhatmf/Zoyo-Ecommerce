import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getSessionAdminId } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Admin Girişi",
  robots: { index: false },
};

export default async function AdminLoginPage() {
  if (await getSessionAdminId()) redirect("/admin");

  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-heading text-xl font-medium tracking-[0.18em] uppercase">
            {settings.siteShortName || "Zoyo"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Yönetim Paneli</p>
        </div>
        <div className="mt-8 rounded-md border border-border bg-card p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
