import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ShowcaseRow } from "@/components/storefront/showcase-row";
import { toShowcaseData } from "@/lib/product";
import { getStorefrontTexts } from "@/lib/storefront-text";
import { getShowcaseProducts } from "@/services/catalog.service";

// Ana sayfa "Vitrin": admin'in seçtiği ürünler, tam genişlik dönüşümlü
// satırlar halinde ve scroll ile beliren animasyonla gösterilir.
export async function ShowcaseSection() {
  const [products, texts] = await Promise.all([
    getShowcaseProducts(4),
    getStorefrontTexts(),
  ]);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-heading text-2xl font-medium sm:text-3xl">
          {texts["homepage.featuredHeading"]}
        </h2>
        <Link
          href="/urunler"
          className="group inline-flex items-center gap-1.5 pb-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {texts["homepage.allProducts"]}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-12 space-y-16 md:mt-16 md:space-y-24">
        {products.map((product, index) => (
          <ShowcaseRow
            key={product.id}
            index={index}
            product={toShowcaseData(product)}
          />
        ))}
      </div>
    </section>
  );
}
