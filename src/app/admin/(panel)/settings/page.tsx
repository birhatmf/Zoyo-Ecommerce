import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ayarlar" };

const sections = [
  {
    href: "/admin/settings/company",
    title: "Firma & Marka",
    description: "Firma adı, açıklama, logo, favicon ve sipariş ön eki.",
  },
  {
    href: "/admin/settings/contact",
    title: "İletişim",
    description: "Telefon, WhatsApp, e-posta, adres, sosyal medya.",
  },
  {
    href: "/admin/settings/bank",
    title: "Banka Hesapları",
    description: "IBAN bilgileri; sipariş sonrası ekranda gösterilir.",
  },
  {
    href: "/admin/settings/order-notes",
    title: "Checkout Maddeleri",
    description: "Sipariş formunda müşteriye gösterilen bilgilendirme maddeleri.",
  },
  {
    href: "/admin/settings/texts",
    title: "Storefront Metinleri",
    description: "Navbar, footer, checkout ve başarı ekranındaki sabit metinler.",
  },
];

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-xl font-medium">Ayarlar</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-md border border-border bg-card p-5 transition-colors hover:bg-muted/50"
          >
            <p className="text-sm font-medium">{section.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
