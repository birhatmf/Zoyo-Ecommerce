import Link from "next/link";

import { SmartImage } from "@/components/storefront/smart-image";
import { discountPercent, formatPrice } from "@/lib/format";

export type ProductCardData = {
  slug: string;
  name: string;
  price: string;
  discountPrice: string | null;
  coverImage: { url: string; altText: string | null } | null;
  hoverImage: { url: string; altText: string | null } | null;
};

export function ProductCard({
  product,
  priority,
  headingLevel = "h3",
}: {
  product: ProductCardData;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const discount =
    product.discountPrice !== null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < Number(product.price)
      ? product.discountPrice
      : null;
  const percent = discount ? discountPercent(product.price, discount) : null;
  const Heading = headingLevel;

  return (
    <Link
      href={`/urun/${product.slug}`}
      className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
        {/* Hover'da hafif yakınlaşma; varsa ikinci görsele yumuşak geçiş */}
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <SmartImage
            src={product.coverImage?.url}
            alt={product.coverImage?.altText || product.name}
            fallbackLabel={product.name}
            priority={priority}
          />
          {product.hoverImage && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100">
              <SmartImage src={product.hoverImage.url} alt="" />
            </div>
          )}
        </div>
        <span className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 rounded-md bg-background/95 py-2 text-center text-xs font-medium text-foreground opacity-0 shadow-sm transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          Ürünü İncele
        </span>
      </div>
      <div className="pt-3.5">
        <Heading className="text-sm font-medium text-foreground">{product.name}</Heading>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {discount ? (
            <>
              {percent !== null && (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  -%{percent}
                </span>
              )}
              <span className="font-medium text-accent">{formatPrice(discount)}</span>
              <span className="text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-foreground">{formatPrice(product.price)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
