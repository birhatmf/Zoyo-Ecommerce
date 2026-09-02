import "server-only";

import { prisma } from "@/lib/prisma";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: true,
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
    where: { status: "ACTIVE", categoryId },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}
