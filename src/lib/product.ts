type WithImages = {
  slug: string;
  name: string;
  price: string | number | { toString(): string };
  discountPrice: string | number | { toString(): string } | null;
  images: { url: string; altText: string | null; isCover: boolean; sortOrder: number }[];
};

export function getCoverImage(product: WithImages) {
  return product.images.find((image) => image.isCover) ?? product.images[0] ?? null;
}

export function toProductCardData(product: WithImages) {
  const cover = getCoverImage(product);
  return {
    slug: product.slug,
    name: product.name,
    price: String(product.price),
    discountPrice:
      product.discountPrice !== null && product.discountPrice !== undefined
        ? String(product.discountPrice)
        : null,
    coverImage: cover ? { url: cover.url, altText: cover.altText } : null,
  };
}
