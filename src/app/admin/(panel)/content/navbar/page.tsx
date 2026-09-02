import type { Metadata } from "next";
import Link from "next/link";

import { NavbarLinksManager } from "@/components/admin/navbar-links-manager";
import { getHeaderLinks } from "@/services/content.service";

export const metadata: Metadata = { title: "Menü (Navbar)" };

export default async function AdminNavbarPage() {
  const links = await getHeaderLinks();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/content"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← İçerik
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Menü (Navbar)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Üst menüdeki bağlantıları yönetin. Kategori sayfası
        (<code className="rounded bg-muted px-1">/kategori/slug</code>), ürünler,
        kurumsal sayfalar veya dış adresler kullanabilirsiniz. Hiç link yoksa
        varsayılan menü gösterilir.
      </p>
      <div className="mt-6">
        <NavbarLinksManager
          links={links.map((link) => ({
            id: link.id,
            label: link.label,
            href: link.href,
            sortOrder: link.sortOrder,
          }))}
        />
      </div>
    </div>
  );
}
