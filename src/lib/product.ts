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

// Kart hover'ında gösterilecek ikinci görsel (kapak dışındaki ilk görsel).
export function getHoverImage(product: WithImages) {
  const cover = getCoverImage(product);
  return product.images.find((image) => image !== cover) ?? null;
}

export function toProductCardData(product: WithImages) {
  const cover = getCoverImage(product);
  const hover = getHoverImage(product);
  return {
    slug: product.slug,
    name: product.name,
    price: String(product.price),
    discountPrice:
      product.discountPrice !== null && product.discountPrice !== undefined
        ? String(product.discountPrice)
        : null,
    coverImage: cover ? { url: cover.url, altText: cover.altText } : null,
    hoverImage: hover ? { url: hover.url, altText: hover.altText } : null,
  };
}

type WithShowcase = WithImages & {
  shortDescription: string | null;
  categories: { name: string; slug: string }[];
};

export function toShowcaseData(product: WithShowcase) {
  const cover = getCoverImage(product);
  return {
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    price: String(product.price),
    discountPrice:
      product.discountPrice !== null && product.discountPrice !== undefined
        ? String(product.discountPrice)
        : null,
    coverImage: cover ? { url: cover.url, altText: cover.altText } : null,
    categories: product.categories.map((category) => ({
      name: category.name,
      slug: category.slug,
    })),
  };
}
