import type { Metadata } from "next";

import Link from "next/link";

import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Yeni Kategori" };

export default function NewCategoryPage() {
  return (
    <div>
      <Link
        href="/admin/categories"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Kategoriler
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Yeni Kategori</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
