import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CmsPageForm } from "@/components/admin/cms-page-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Sayfayı Düzenle" };

type EditCmsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCmsPage({ params }: EditCmsPageProps) {
  const { id } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/content/pages"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Sayfalar
        </Link>
        <Link
          href={`/${page.slug}`}
          target="_blank"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Sitede görüntüle ↗
        </Link>
      </div>
      <h1 className="mt-1 font-heading text-xl font-medium">{page.title}</h1>
      <div className="mt-6">
        <CmsPageForm
          defaults={{
            id: page.id,
            title: page.title,
            slug: page.slug,
            type: page.type,
            content: page.content,
            active: page.active,
            seoTitle: page.seoTitle ?? "",
            seoDescription: page.seoDescription ?? "",
          }}
        />
      </div>
    </div>
  );
}
