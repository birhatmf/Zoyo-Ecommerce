import type { Metadata } from "next";
import Link from "next/link";

import { SiteManagementForm } from "@/components/admin/site-management-form";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Site Yönetimi" };

export default async function AdminSiteManagementPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/settings"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Ayarlar
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Site Yönetimi</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bakım modu ve site görsel ayarları.
      </p>
      <p
        className={`mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs ${
          settings.maintenanceMode === "true"
            ? "border-destructive/30 bg-destructive/5 text-destructive"
            : "border-primary/20 bg-primary/5 text-primary"
        }`}
      >
        Şu an: {settings.maintenanceMode === "true" ? "Bakım modu AÇIK" : "Site yayında"}
      </p>
      <div className="mt-6">
        <SiteManagementForm defaults={settings} />
      </div>
    </div>
  );
}
