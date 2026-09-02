import type { Metadata } from "next";

import Link from "next/link";

import { CmsPageForm } from "@/components/admin/cms-page-form";

export const metadata: Metadata = { title: "Yeni Sayfa" };

export default function NewCmsPagePage() {
  return (
    <div>
      <Link
        href="/admin/content/pages"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Sayfalar
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Yeni Sayfa</h1>
      <div className="mt-6">
        <CmsPageForm />
      </div>
    </div>
  );
}
