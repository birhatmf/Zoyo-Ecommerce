import type { Metadata } from "next";

import Link from "next/link";

import { ShowcaseManager } from "@/components/admin/showcase-manager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Vitrin" };

export default async function AdminShowcasePage() {
  const [items, products] = await Promise.all([
    prisma.showcaseProduct.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        product: {
          include: {
            images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 },
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const chosen = new Set(items.map((item) => item.productId));
  const options = products.filter((product) => !chosen.has(product.id));

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/content"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← İçerik
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Vitrin Ürünleri</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ana sayfada gösterilecek ürünleri seçin ve sıralayın. En fazla 4 ürün
        gösterilir; yalnızca yayındaki ürünler listelenir.
      </p>
      <div className="mt-6">
        <ShowcaseManager
          items={items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            coverUrl: item.product.images[0]?.url ?? null,
          }))}
          options={options}
        />
      </div>
    </div>
  );
}
