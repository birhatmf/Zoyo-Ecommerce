import type { Metadata } from "next";

import Link from "next/link";

import { deleteCategoryAction } from "@/app/admin/(panel)/categories/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Kategoriler" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-xl font-medium">Kategoriler</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Yeni Kategori
        </Link>
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
                  Henüz kategori yok.
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
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <button
                      type="submit"
                      className="text-xs text-destructive underline-offset-4 hover:underline"
                    >
                      Sil
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
