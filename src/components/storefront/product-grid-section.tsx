import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard, type ProductCardData } from "@/components/storefront/product-card";
import { toProductCardData } from "@/lib/product";
import { getStorefrontTexts } from "@/lib/storefront-text";
import {
  getActiveProducts,
  getFeaturedProducts,
  getShowcaseProducts,
} from "@/services/catalog.service";

// Sunumsal ürün ızgarası: başlık + "tümü" linki + ProductCard grid.
function ProductGridSection({
  heading,
  linkLabel,
  products,
}: {
  heading: string;
  linkLabel: string;
  products: ProductCardData[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-heading text-2xl font-medium sm:text-3xl">
          {heading}
        </h2>
        <Link
          href="/urunler"
          className="group inline-flex items-center gap-1.5 pb-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            priority={index < 4}
            headingLevel="h3"
          />
        ))}
      </div>
    </section>
  );
}

// Admin'in "öne çıkar" olarak işaretlediği ürünler.
export async function FeaturedProductsSection() {
  const [products, texts] = await Promise.all([
    getFeaturedProducts(),
    getStorefrontTexts(),
  ]);

  if (products.length === 0) return null;

  return (
    <ProductGridSection
      heading={texts["homepage.featuredHeading"]}
      linkLabel={texts["homepage.allProducts"]}
      products={products.map(toProductCardData)}
    />
  );
}

// Vitrin ve öne çıkanlar boşsa sayfanın boş kalmaması için tüm ürünleri gösterir.
export async function ProductsFallbackSection() {
  const [showcase, featured] = await Promise.all([
    getShowcaseProducts(1),
    getFeaturedProducts(),
  ]);
  if (showcase.length > 0 || featured.length > 0) return null;

  const [products, texts] = await Promise.all([
    getActiveProducts(),
    getStorefrontTexts(),
  ]);
  if (products.length === 0) return null;

  return (
    <ProductGridSection
      heading={texts["homepage.allProducts"]}
      linkLabel={texts["homepage.viewAll"]}
      products={products.slice(0, 8).map(toProductCardData)}
    />
  );
}
