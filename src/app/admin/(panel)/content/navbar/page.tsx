import type { Metadata } from "next";
import Link from "next/link";

import { NavbarInlineEditor } from "@/components/admin/navbar-inline-editor";
import { getHeaderLinks } from "@/services/content.service";
import { getSiteSettings } from "@/lib/settings";
import { getActiveCategories } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Menü (Navbar)" };

export default async function AdminNavbarPage() {
  const [links, settings, categories] = await Promise.all([
    getHeaderLinks(),
    getSiteSettings(),
    getActiveCategories(),
  ]);

  const siteName = settings.siteShortName || settings.siteName || "Zoyo";

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/content"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← İçerik
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Menü (Navbar)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Navbar linklerini doğrudan önizleme üzerinde düzenleyin. Hiç link yoksa
        varsayılan menü (Ürünler, Hakkımızda, İletişim) gösterilir.
      </p>

      <div className="mt-6">
        <NavbarInlineEditor
          siteName={siteName}
          links={links.map((link) => ({
            id: link.id,
            label: link.label,
            href: link.href,
            sortOrder: link.sortOrder,
          }))}
          categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        />
      </div>
    </div>
  );
}
