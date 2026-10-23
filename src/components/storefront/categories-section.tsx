import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SmartImage } from "@/components/storefront/smart-image";
import { getStorefrontTexts } from "@/lib/storefront-text";
import { getActiveCategories } from "@/services/catalog.service";

export async function CategoriesSection() {
  const [categories, texts] = await Promise.all([
    getActiveCategories(),
    getStorefrontTexts(),
  ]);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-heading text-2xl font-medium sm:text-3xl">
          {texts["homepage.categoriesHeading"]}
        </h2>
        <Link
          href="/urunler"
          className="group inline-flex items-center gap-1.5 pb-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {texts["homepage.viewAll"]}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/kategori/${category.slug}`}
              className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                <SmartImage
                  src={category.image}
                  alt={category.name}
                  fallbackLabel={category.name}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent p-3 pt-12">
                  <h3 className="font-heading text-base font-medium text-background">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
