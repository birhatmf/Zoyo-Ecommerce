import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/storefront/product-card";
import { toProductCardData } from "@/lib/product";
import {
  getActiveCategories,
  getActiveProducts,
} from "@/services/catalog.service";

export const metadata: Metadata = {
  title: "Ürünler",
  description: "Butik ahşap mobilya koleksiyonumuz.",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getActiveCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <header>
        <h1 className="font-heading text-3xl font-medium sm:text-4xl">Ürünler</h1>
        {categories.length > 0 && (
          <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2" aria-label="Kategoriler">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={toProductCardData(product)} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          Henüz yayında ürün bulunmuyor.
        </p>
      )}
    </div>
  );
}
