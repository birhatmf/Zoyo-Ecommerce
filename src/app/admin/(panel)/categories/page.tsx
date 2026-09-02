import type { Metadata } from "next";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

import { deleteCategoryAction } from "@/app/admin/(panel)/categories/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const metadata: Metadata = { title: "Kategoriler" };

type CategoriesPageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const status = params.status;
  const validStatus = status === "active" || status === "inactive" ? status : null;

  const where: Prisma.CategoryWhereInput = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
    ];
  }
  if (validStatus === "active") where.active = true;
  if (validStatus === "inactive") where.active = false;

  const categories = await prisma.category.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  function buildUrl(overrides: Record<string, string | undefined>): string {
    const p = new URLSearchParams();
    const merged = {
      q: query || undefined,
      status: validStatus ?? undefined,
      ...overrides,
    };
    if (merged.q) p.set("q", merged.q);
    if (merged.status) p.set("status", merged.status);
    const qs = p.toString();
    return `/admin/categories${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-xl font-medium">Kategoriler</h1>
        <div className="flex items-center gap-2">
          <form action="/admin/categories" method="get" className="flex gap-2">
            {validStatus && <input type="hidden" name="status" value={validStatus} />}
            <input
              name="q"
              defaultValue={query}
              placeholder="Kategori adı veya slug…"
              aria-label="Kategori ara"
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
            href="/admin/categories/new"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Yeni Kategori
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterChip label="Tümü" href={buildUrl({ status: undefined })} active={!validStatus} />
        <FilterChip label="Yayında" href={buildUrl({ status: "active" })} active={validStatus === "active"} />
        <FilterChip label="Pasif" href={buildUrl({ status: "inactive" })} active={validStatus === "inactive"} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Slug</th>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="px-4 py-3 font-medium">Sıra</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {category.name}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{category.slug}</td>
                <td className="px-4 py-3">{category._count.products}</td>
                <td className="px-4 py-3">{category.sortOrder}</td>
                <td className="px-4 py-3">
                  {category.active ? (
                    <span className="inline-block rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs text-primary">Yayında</span>
                  ) : (
                    <span className="inline-block rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 text-xs text-destructive">Pasif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <ConfirmDeleteButton
                    action={deleteCategoryAction}
                    hiddenFields={{ id: category.id }}
                    entityName={category.name}
                  />
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
