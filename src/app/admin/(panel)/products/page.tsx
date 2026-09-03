import type { Metadata } from "next";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { ProductTable } from "@/components/admin/product-table";

export const metadata: Metadata = { title: "Ürünler" };

const PAGE_SIZE = 20;

const STATUS_LABELS = { DRAFT: "Taslak", ACTIVE: "Yayında", INACTIVE: "Pasif" } as const;

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const validStatus =
    params.status === "DRAFT" || params.status === "ACTIVE" || params.status === "INACTIVE"
      ? params.status
      : null;
  const categoryId = params.category ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.ProductWhereInput = {};
  if (validStatus) where.status = validStatus;
  if (categoryId) where.categoryId = categoryId;
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { productCode: { contains: query, mode: "insensitive" } },
    ];
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildPageUrl(targetPage: number): string {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (validStatus) p.set("status", validStatus);
    if (categoryId) p.set("category", categoryId);
    if (targetPage > 1) p.set("page", String(targetPage));
    const qs = p.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  function buildFilterUrl(overrides: Record<string, string | undefined>): string {
    const p = new URLSearchParams();
    const merged = {
      q: query || undefined,
      status: validStatus ?? undefined,
      category: categoryId || undefined,
      ...overrides,
    };
    if (merged.q) p.set("q", merged.q);
    if (merged.status) p.set("status", merged.status);
    if (merged.category) p.set("category", merged.category);
    const qs = p.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-xl font-medium">Ürünler</h1>
        <div className="flex items-center gap-2">
          <form action="/admin/products" method="get" className="flex gap-2">
            {validStatus && <input type="hidden" name="status" value={validStatus} />}
            {categoryId && <input type="hidden" name="category" value={categoryId} />}
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

      {/* Filtreler: durum + kategori */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FilterChip
          label="Tümü"
          href={buildFilterUrl({ status: undefined })}
          active={!validStatus}
        />
        {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            href={buildFilterUrl({ status: s })}
            active={validStatus === s}
          />
        ))}
        <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
        <form action="/admin/products" method="get" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {query && <input type="hidden" name="q" value={query} />}
          {validStatus && <input type="hidden" name="status" value={validStatus} />}
          <label htmlFor="category-filter">Kategori</label>
          <select
            id="category-filter"
            name="category"
            defaultValue={categoryId}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring"
          >
            <option value="">Tümü</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-8 rounded-md border border-border px-2.5 text-xs transition-colors hover:bg-muted"
          >
            Uygula
          </button>
        </form>
      </div>

      <p className="mt-3 text-xs text-muted-foreground" role="status">
        {total} ürün
        {totalPages > 1 ? ` — sayfa ${page}/${totalPages}` : ""}
      </p>

      <div className="mt-3">
        <ProductTable
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            productCode: p.productCode,
            featured: p.featured,
            price: p.price,
            status: p.status,
            categoryName: p.category?.name ?? null,
            coverUrl: p.images[0]?.url ?? null,
          }))}
          categories={categories}
        />
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} kayıt — sayfa {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1)}
                className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-muted"
              >
                Önceki
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1)}
                className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-muted"
              >
                Sonraki
              </Link>
            )}
          </div>
        </div>
      )}
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
