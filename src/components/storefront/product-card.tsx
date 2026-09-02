import Link from "next/link";

import { SmartImage } from "@/components/storefront/smart-image";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  slug: string;
  name: string;
  price: string;
  discountPrice: string | null;
  coverImage: { url: string; altText: string | null } | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.discountPrice !== null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < Number(product.price)
      ? product.discountPrice
      : null;

  return (
    <Link href={`/urun/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
        <SmartImage
          src={product.coverImage?.url}
          alt={product.coverImage?.altText || product.name}
          fallbackLabel={product.name}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="pt-3.5">
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <p className="mt-1 text-sm">
          {discount ? (
            <>
              <span className="font-medium text-accent">{formatPrice(discount)}</span>
              <span className="ml-2 text-muted-foreground line-through">
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
