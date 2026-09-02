import type { Metadata } from "next";
import Link from "next/link";

import { SettingsForm } from "@/components/admin/settings-form";
import type { SettingsField } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "İletişim Ayarları" };

const fields: SettingsField[] = [
  { name: "phone", label: "Telefon", placeholder: "+905550000000" },
  {
    name: "whatsapp",
    label: "WhatsApp Numarası",
    placeholder: "+905550000000",
    hint: "Ürün ve sipariş sayfalarındaki WhatsApp butonlarında kullanılır",
  },
  { name: "email", label: "E-posta" },
  { name: "workingHours", label: "Çalışma Saatleri" },
  { name: "instagram", label: "Instagram URL" },
  { name: "facebook", label: "Facebook URL" },
  { name: "youtube", label: "YouTube URL" },
];

export default async function AdminContactSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/settings"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Ayarlar
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">İletişim</h1>
      <div className="mt-6">
        <SettingsForm fields={fields} defaults={settings} />
      </div>
    </div>
  );
}
