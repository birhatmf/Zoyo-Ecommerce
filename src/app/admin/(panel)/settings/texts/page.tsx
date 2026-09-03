import type { Metadata } from "next";
import Link from "next/link";

import { StorefrontTextForm } from "@/components/admin/storefront-text-form";
import { getStorefrontTexts, STOREFRONT_TEXT_DEFS } from "@/lib/storefront-text";

export const metadata: Metadata = { title: "Storefront Metinleri" };

// Navbar ve footer metinleri kendi sayfalarında canlı önizlemeyle düzenlendiği
// için burada tekrar edilmez (tek kaynak ilkesi). Yalnızca inline editor'ü
// olmayan genel/checkout/sepet metinleri bu sayfadan yönetilir.
const TEXT_GROUPS = ["homepage", "cart", "checkout", "orderSuccess"] as const;

export default async function AdminStorefrontTextsPage() {
  const texts = await getStorefrontTexts();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/settings"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Ayarlar
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Storefront Metinleri</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Müşteriye görünen sabit metinleri buradan düzenleyin. Navbar ve footer
        metinleri ilgili sayfaların canlı önizlemesinden düzenlenir.
      </p>

      <div className="mt-6 space-y-8">
        {TEXT_GROUPS.map((group) => {
          const defs = STOREFRONT_TEXT_DEFS.filter((d) => d.group === group);
          if (defs.length === 0) return null;
          return (
            <section key={group} className="rounded-md border border-border bg-card p-5">
              <h2 className="text-sm font-medium">{groupLabel(group)}</h2>
              <div className="mt-4 space-y-4">
                {defs.map((def) => (
                  <StorefrontTextForm
                    key={def.key}
                    fieldKey={def.key}
                    label={def.label}
                    defaultValue={texts[def.key] ?? def.defaultValue}
                    multiline={def.multiline}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function groupLabel(group: string): string {
  const labels: Record<string, string> = {
    homepage: "Ana Sayfa",
    cart: "Sepet",
    checkout: "Sipariş (Checkout)",
    orderSuccess: "Sipariş Başarı Ekranı",
  };
  return labels[group] ?? group;
}
