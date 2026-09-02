import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Kategoriyi Düzenle" };

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <Link
        href="/admin/categories"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Kategoriler
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">{category.name}</h1>
      <div className="mt-6">
        <CategoryForm
          defaults={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            image: category.image ?? "",
            active: category.active,
            sortOrder: category.sortOrder,
            seoTitle: category.seoTitle ?? "",
            seoDescription: category.seoDescription ?? "",
          }}
        />
      </div>
    </div>
  );
}
