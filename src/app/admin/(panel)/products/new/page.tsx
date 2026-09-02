import type { Metadata } from "next";

import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Yeni Ürün" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Ürünler
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Yeni Ürün</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
