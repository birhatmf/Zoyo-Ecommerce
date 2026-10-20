"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SmartImage } from "@/components/storefront/smart-image";
import { formatPrice } from "@/lib/format";

export type ShowcaseData = {
  slug: string;
  name: string;
  shortDescription: string | null;
  price: string;
  discountPrice: string | null;
  coverImage: { url: string; altText: string | null } | null;
  categories: { name: string; slug: string }[];
};

export function ShowcaseRow({
  product,
  index,
}: {
  product: ShowcaseData;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Azaltılmış hareket tercihi CSS tarafında karşılanır (.reveal görünür kalır).
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const discount =
    product.discountPrice !== null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < Number(product.price)
      ? product.discountPrice
      : null;

  const imageFirst = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} grid items-center gap-8 lg:grid-cols-2 lg:gap-14`}
    >
      <div
        className={`group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted ${
          imageFirst ? "" : "lg:order-2"
        }`}
      >
        <SmartImage
          src={product.coverImage?.url}
          alt={product.coverImage?.altText || product.name}
          fallbackLabel={product.name}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>

      <div className={imageFirst ? "" : "lg:order-1"}>
        <span className="text-xs font-medium tracking-[0.25em] text-accent uppercase">
          {String(index + 1).padStart(2, "0")} — Vitrin
        </span>
        <h3 className="mt-4 font-heading text-2xl leading-tight font-medium sm:text-3xl">
          <Link
            href={`/urun/${product.slug}`}
            className="transition-opacity hover:opacity-80"
          >
            {product.name}
          </Link>
        </h3>
        {product.shortDescription && (
          <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {discount ? (
            <>
              <span className="font-heading text-2xl font-medium text-accent">
                {formatPrice(discount)}
              </span>
              <span className="text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-heading text-2xl font-medium">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {product.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {product.categories.map((category) => (
              <Link
                key={category.slug}
                href={`/kategori/${category.slug}`}
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        <Link
          href={`/urun/${product.slug}`}
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Ürünü İncele
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
