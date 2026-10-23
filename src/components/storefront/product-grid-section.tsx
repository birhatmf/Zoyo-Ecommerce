import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard, type ProductCardData } from "@/components/storefront/product-card";
import { toProductCardData } from "@/lib/product";
import { getStorefrontTexts } from "@/lib/storefront-text";
import {
  getDiscountedProducts,
  getFeaturedProducts,
  getNewestProducts,
} from "@/services/catalog.service";

// Sunumsal ürün ızgarası: başlık + "tümü" linki + ProductCard grid.
// priorityCount: yalnızca ekranın üstünde kalan kartlar önceliklendirilir.
function ProductGridSection({
  heading,
  linkLabel,
  products,
  priorityCount = 0,
}: {
  heading: string;
  linkLabel: string;
  products: ProductCardData[];
  priorityCount?: number;
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
            priority={index < priorityCount}
            headingLevel="h3"
          />
        ))}
      </div>
    </section>
  );
}

// Admin'in "öne çıkar" olarak işaretlediği ürünler (sayfanın ilk ürün bölümü).
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
      priorityCount={4}
    />
  );
}

export async function DiscountedProductsSection() {
  const [products, texts] = await Promise.all([
    getDiscountedProducts(4),
    getStorefrontTexts(),
  ]);

  if (products.length === 0) return null;

  return (
    <ProductGridSection
      heading={texts["homepage.discountsHeading"]}
      linkLabel={texts["homepage.allProducts"]}
      products={products.map(toProductCardData)}
    />
  );
}

export async function NewestProductsSection() {
  const [products, texts] = await Promise.all([
    getNewestProducts(8),
    getStorefrontTexts(),
  ]);

  if (products.length === 0) return null;

  return (
    <ProductGridSection
      heading={texts["homepage.newestHeading"]}
      linkLabel={texts["homepage.allProducts"]}
      products={products.map(toProductCardData)}
    />
  );
}
