import { HeaderBar } from "@/components/storefront/header-bar";
import { whatsappUrl } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { getActiveCategories } from "@/services/catalog.service";
import { getHeaderLinks } from "@/services/content.service";

// Yönetim panelinden link tanımlanmamışsa kullanılan varsayılan menü
const defaultLinks = [
  { label: "Ürünler", href: "/urunler" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
];

export async function Header({ overlay = false }: { overlay?: boolean }) {
  const [settings, categories, headerLinks] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getHeaderLinks(),
  ]);

  const siteName = settings.siteShortName || settings.siteName || "Zoyo";
  const waLink = settings.whatsapp
    ? whatsappUrl(settings.whatsapp, "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.")
    : null;

  return (
    <HeaderBar
      siteName={siteName}
      siteTitle={settings.siteName || siteName}
      logoUrl={settings.logoUrl || undefined}
      links={
        headerLinks.length > 0
          ? headerLinks.map((link) => ({ label: link.label, href: link.href }))
          : defaultLinks
      }
      categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      waLink={waLink}
      overlay={overlay}
    />
  );
}
