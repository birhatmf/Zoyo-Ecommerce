import "server-only";

import { prisma } from "@/lib/prisma";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  categories: true,
} as const;

export async function getActiveProducts() {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: productInclude,
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, active: true } });
}

export async function getProductsByCategory(categoryId: string) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", categories: { some: { id: categoryId } } },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

// Ana sayfa "Vitrin": admin'in seçtiği, sıralı ve aktif ürünler.
export async function getShowcaseProducts(limit = 4) {
  const items = await prisma.showcaseProduct.findMany({
    where: { product: { status: "ACTIVE" } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: limit,
    include: { product: { include: productInclude } },
  });
  return items.map((item) => item.product);
}

// İndirimli fiyatı normal fiyatından küçük olan aktif ürünler.
// discountPrice ile price kolon karşılaştırması Prisma'da doğrudan
// yapılamadığı için eşleşenler JS tarafında filtrelenir.
export async function getDiscountedProducts(limit = 4) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", discountPrice: { not: null } },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
  });
  return products
    .filter(
      (product) =>
        product.discountPrice !== null &&
        Number(product.discountPrice) > 0 &&
        Number(product.discountPrice) < Number(product.price),
    )
    .slice(0, limit);
}

export async function getNewestProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
