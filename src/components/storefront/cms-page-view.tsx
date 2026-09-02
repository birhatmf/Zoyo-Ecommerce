import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { sanitizeCmsContent } from "@/lib/cms";

type CmsPageViewProps = {
  slug: string;
};

export async function getCmsPage(slug: string) {
  return prisma.cmsPage.findFirst({ where: { slug, active: true } });
}

export async function generateCmsMetadata(
  slug: string,
  fallbackTitle: string,
): Promise<Metadata> {
  const page = await getCmsPage(slug);
  const title = page?.seoTitle || page?.title || fallbackTitle;
  return {
    title,
    description: page?.seoDescription || undefined,
    openGraph: {
      title,
      description: page?.seoDescription || undefined,
    },
  };
}

export async function CmsPageView({ slug }: CmsPageViewProps) {
  const page = await getCmsPage(slug);
  if (!page) notFound();

  const html = sanitizeCmsContent(page.content);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-heading text-3xl font-medium sm:text-4xl">{page.title}</h1>
      <div
        className="cms-content mt-8 space-y-4 leading-relaxed text-muted-foreground [&_a]:text-accent [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-foreground [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-foreground [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
