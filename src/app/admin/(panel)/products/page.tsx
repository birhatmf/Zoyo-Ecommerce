import type { Metadata } from "next";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Ürünler" };

const STATUS_LABELS = { DRAFT: "Taslak", ACTIVE: "Yayında", INACTIVE: "Pasif" } as const;
const STATUS_CLASSES = {
  DRAFT: "border-border text-muted-foreground",
  ACTIVE: "border-transparent bg-primary/10 text-primary",
  INACTIVE: "border-destructive/20 bg-destructive/5 text-destructive",
} as const;

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const { q, status } = await searchParams;
  const query = (q ?? "").trim();
  const validStatus =
    status === "DRAFT" || status === "ACTIVE" || status === "INACTIVE" ? status : null;

  const where: Prisma.ProductWhereInput = {};
  if (validStatus) where.status = validStatus;
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { productCode: { contains: query, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-xl font-medium">Ürünler</h1>
        <div className="flex items-center gap-2">
          <form action="/admin/products" method="get" className="flex gap-2">
            {validStatus && <input type="hidden" name="status" value={validStatus} />}
            <input
              name="q"
              defaultValue={query}
              placeholder="Ürün adı veya kodu…"
              aria-label="Ürün ara"
              className="h-9 w-52 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
            />
            <button
              type="submit"
              className="h-9 rounded-md border border-border px-3 text-sm transition-colors hover:bg-muted"
            >
              Ara
            </button>
          </form>
          <Link
            href="/admin/products/new"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Yeni Ürün
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterChip label="Tümü" href="/admin/products" active={!validStatus} />
        {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            href={`/admin/products?status=${s}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            active={validStatus === s}
          />
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Görsel</th>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Kod</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Kategori</th>
              <th className="px-4 py-3 font-medium">Fiyat</th>
              <th className="px-4 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0].url}
                      alt=""
                      className="size-10 rounded-sm object-cover"
                    />
                  ) : (
                    <span className="block size-10 rounded-sm bg-muted" />
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {product.name}
                    {product.featured && (
                      <span title="Öne çıkan" className="ml-1.5 text-xs text-accent">★</span>
                    )}
                  </Link>
                </td>
                <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">{product.productCode}</td>
                <td className="hidden px-4 py-2.5 text-muted-foreground lg:table-cell">{product.category?.name ?? "—"}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{formatPrice(product.price)}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${STATUS_CLASSES[product.status]}`}>
                    {STATUS_LABELS[product.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-transparent bg-primary font-medium text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
