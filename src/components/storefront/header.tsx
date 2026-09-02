import { HeaderBar } from "@/components/storefront/header-bar";
import { whatsappUrl } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { getStorefrontTexts } from "@/lib/storefront-text";
import { getActiveCategories } from "@/services/catalog.service";
import { getHeaderLinks } from "@/services/content.service";

export async function Header({ overlay = false }: { overlay?: boolean }) {
  const [settings, categories, headerLinks, texts] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getHeaderLinks(),
    getStorefrontTexts(),
  ]);

  const siteName = settings.siteShortName || settings.siteName || "Zoyo";
  const waLink = settings.whatsapp
    ? whatsappUrl(settings.whatsapp, "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.")
    : null;

  // Yönetim panelinden link tanımlanmamışsa CMS metinleriyle varsayılan menü.
  const defaultLinks = [
    { label: texts["navbar.products"], href: "/urunler" },
    { label: texts["navbar.about"], href: "/hakkimizda" },
    { label: texts["navbar.contact"], href: "/iletisim" },
  ];

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
      texts={{
        categories: texts["navbar.categories"],
        cart: texts["navbar.cart"],
        openMenu: texts["navbar.openMenu"],
        whatsapp: texts["navbar.whatsapp"],
      }}
    />
  );
}
