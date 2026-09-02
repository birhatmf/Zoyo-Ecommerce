import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "İçerik Yönetimi" };

const sections = [
  {
    href: "/admin/content/home",
    title: "Ana Sayfa",
    description: "Hero bölümü, marka hikâyesi ve özel üretim CTA içerikleri.",
  },
  {
    href: "/admin/content/navbar",
    title: "Menü (Navbar)",
    description: "Üst menü bağlantıları; kategori veya özel sayfa hedefleri.",
  },
  {
    href: "/admin/content/footer",
    title: "Footer",
    description: "Copyright metni ve footer link grupları yönetimi.",
  },
  {
    href: "/admin/content/pages",
    title: "Sayfalar",
    description: "KVKK, gizlilik, sözleşme ve kurumsal sayfa içerikleri.",
  },
];

export default function AdminContentPage() {
  return (
    <div>
      <h1 className="font-heading text-xl font-medium">İçerik Yönetimi</h1>
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
