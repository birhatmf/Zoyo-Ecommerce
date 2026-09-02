import type { Metadata } from "next";
import Link from "next/link";

import { uploadSettingImageAction } from "@/app/admin/(panel)/settings/actions";
import { SettingsForm } from "@/components/admin/settings-form";
import type { SettingsField } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Firma & Marka" };

const fields: SettingsField[] = [
  { name: "siteName", label: "Firma Adı" },
  { name: "siteShortName", label: "Kısa Firma Adı (logo metni)" },
  { name: "siteDescription", label: "Firma Açıklaması", type: "textarea" },
  { name: "orderPrefix", label: "Sipariş Numarası Ön Eki", hint: "Örn. ZY → ZY-2026-000001" },
  { name: "logoUrl", label: "Logo", type: "media" },
  { name: "mobileLogoUrl", label: "Mobil Logo", type: "media" },
  { name: "footerLogoUrl", label: "Footer Logo", type: "media" },
  { name: "faviconUrl", label: "Favicon", type: "media" },
  { name: "address", label: "Adres", type: "textarea" },
];

export default async function AdminCompanySettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/settings"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Ayarlar
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Firma & Marka</h1>
      <div className="mt-6">
        <SettingsForm
          fields={fields}
          defaults={settings}
          uploadAction={uploadSettingImageAction}
        />
      </div>
    </div>
  );
}
