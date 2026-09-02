import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/storefront/product-card";
import { toProductCardData } from "@/lib/product";
import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/services/catalog.service";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori" };
  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || undefined,
    openGraph: {
      title: category.seoTitle || category.name,
      description: category.seoDescription || category.description || undefined,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <header>
        <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
          Kategori
        </p>
        <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            {category.description}
          </p>
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
          Bu kategoride henüz ürün bulunmuyor.
        </p>
      )}
    </div>
  );
}
