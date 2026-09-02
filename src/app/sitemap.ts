import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  const staticPaths = [
    "",
    "/urunler",
    "/hakkimizda",
    "/iletisim",
    "/kvkk",
    "/gizlilik-politikasi",
    "/mesafeli-satis-sozlesmesi",
    "/teslimat-ve-iade",
  ];

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { active: true },
      select: { slug: true },
    }),
  ]);

  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...categories.map((category) => ({
      url: `${base}/kategori/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: `${base}/urun/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
