import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteProductAction } from "@/app/admin/(panel)/products/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Ürünü Düzenle" };

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
        categories: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Ürünler
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="mt-1 font-heading text-xl font-medium">{product.name}</h1>
        <div className="flex items-center gap-2">
          <ConfirmDeleteButton
            action={deleteProductAction}
            hiddenFields={{ id: product.id }}
            label="Ürünü Sil"
            entityName={product.name}
          />
        </div>
      </div>

      <div className="mt-6">
        <ProductForm
          categories={categories}
          images={product.images.map((image) => ({
            id: image.id,
            url: image.url,
            altText: image.altText,
            isCover: image.isCover,
          }))}
          defaults={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            productCode: product.productCode,
            shortDescription: product.shortDescription ?? "",
            description: product.description ?? "",
            price: String(Number(product.price)),
            discountPrice:
              product.discountPrice !== null ? String(Number(product.discountPrice)) : "",
            categoryIds: product.categories.map((category) => category.id),
            material: product.material ?? "",
            dimensions: product.dimensions ?? "",
            productionTime: product.productionTime ?? "",
            deliveryInformation: product.deliveryInformation ?? "",
            status: product.status,
            featured: product.featured,
            seoTitle: product.seoTitle ?? "",
            seoDescription: product.seoDescription ?? "",
          }}
        />
      </div>
    </div>
  );
}
