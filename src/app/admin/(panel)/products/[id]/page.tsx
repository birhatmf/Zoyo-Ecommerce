import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Star, Trash2 } from "lucide-react";

import {
  addImageUrlAction,
  deleteImageAction,
  deleteProductAction,
  setCoverImageAction,
  updateImageMetaAction,
  uploadProductImageAction,
} from "@/app/admin/(panel)/products/actions";
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
        category: true,
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
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-destructive/30 px-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Ürünü Sil
          </button>
        </form>
      </div>

      {/* Görsel yönetimi */}
      <section className="mt-8 rounded-md border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-medium">Görseller ({product.images.length})</h2>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <form action={uploadProductImageAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="productId" value={product.id} />
              <input
                type="file"
                name="files"
                required
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                aria-label="Görsel dosyalarını seç"
                className="max-w-56 text-xs text-muted-foreground file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground hover:file:bg-muted"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Yükle
              </button>
            </form>
            <details className="text-sm">
              <summary className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">
                URL ile Ekle
              </summary>
              <form action={addImageUrlAction} className="mt-2 flex flex-wrap items-center gap-2">
                <input type="hidden" name="productId" value={product.id} />
                <input
                  name="url"
                  required
                  placeholder="https://... veya /api/media/..."
                  className="h-8 w-56 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-ring"
                />
                <input
                  name="altText"
                  placeholder="Alt metin"
                  className="h-8 w-32 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-ring"
                />
                <button
                  type="submit"
                  className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted"
                >
                  Ekle
                </button>
              </form>
            </details>
          </div>
        </div>

        {product.images.length > 0 ? (
          <>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {product.images.map((image) => (
                <li key={image.id} className="rounded-md border border-border p-3">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="size-full object-cover" />
                    {image.isCover && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                        <Star className="size-3" /> Kapak
                      </span>
                    )}
                  </div>
                  {!image.isCover && (
                    <form action={setCoverImageAction} className="mt-2">
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 text-xs text-accent underline-offset-4 hover:underline"
                      >
                        <Check className="size-3.5" /> Kapak Yap
                      </button>
                    </form>
                  )}
                  <form action={deleteImageAction} className="mt-1.5">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-xs text-destructive underline-offset-4 hover:underline"
                    >
                      <Trash2 className="size-3.5" /> Sil
                    </button>
                  </form>
                </li>
              ))}
            </ul>

            <form action={updateImageMetaAction} className="mt-5 border-t border-border pt-4">
              <input type="hidden" name="productId" value={product.id} />
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground uppercase">
                    <th className="pb-2 font-medium">Alt Metin</th>
                    <th className="w-20 pb-2 font-medium">Sıra</th>
                  </tr>
                </thead>
                <tbody>
                  {product.images.map((image) => (
                    <tr key={`meta-${image.id}`}>
                      <td className="py-1.5 pr-3">
                        <input
                          name={`alt-${image.id}`}
                          defaultValue={image.altText ?? ""}
                          placeholder={product.name}
                          className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
                        />
                      </td>
                      <td className="py-1.5">
                        <input
                          name={`order-${image.id}`}
                          type="number"
                          min="0"
                          max="999"
                          defaultValue={image.sortOrder}
                          className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="submit"
                className="mt-3 h-8 rounded-md border border-border px-4 text-xs font-medium transition-colors hover:bg-muted"
              >
                Alt Metin ve Sıralamayı Kaydet
              </button>
            </form>
          </>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            Henüz görsel eklenmemiş. Dosya yükleyerek veya URL ile ekleyebilirsiniz.
          </p>
        )}
      </section>

      {/* Ürün bilgileri */}
      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <h2 className="mb-6 text-sm font-medium">Ürün Bilgileri</h2>
        <ProductForm
          categories={categories}
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
            categoryId: product.categoryId,
            material: product.material ?? "",
            dimensions: product.dimensions ?? "",
            productionTime: product.productionTime ?? "",
            deliveryInformation: product.deliveryInformation ?? "",
            status: product.status,
            featured: product.featured,
          }}
        />
      </section>
    </div>
  );
}
