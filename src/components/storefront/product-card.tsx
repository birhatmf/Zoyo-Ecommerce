import Link from "next/link";

import { SmartImage } from "@/components/storefront/smart-image";
import { discountPercent, formatPrice } from "@/lib/format";

export type ProductCardData = {
  slug: string;
  name: string;
  price: string;
  discountPrice: string | null;
  coverImage: { url: string; altText: string | null } | null;
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
        <SmartImage
          src={product.coverImage?.url}
          alt={product.coverImage?.altText || product.name}
          fallbackLabel={product.name}
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
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
