import type { Metadata } from "next";
import Link from "next/link";

import { deleteCmsPageAction } from "@/app/admin/(panel)/content/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Sayfalar" };

const TYPE_LABELS = { LEGAL: "Yasal", CORPORATE: "Kurumsal", CUSTOM: "Özel" } as const;

export default async function AdminCmsPagesPage() {
  const pages = await prisma.cmsPage.findMany({
    orderBy: [{ type: "asc" }, { title: "asc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-xl font-medium">Sayfalar</h1>
        <Link
          href="/admin/content/pages/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Yeni Sayfa
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Başlık</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Slug</th>
              <th className="px-4 py-3 font-medium">Tür</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Henüz sayfa yok.
                </td>
              </tr>
            )}
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/content/pages/${page.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {page.title}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">/{page.slug}</td>
                <td className="px-4 py-3">{TYPE_LABELS[page.type]}</td>
                <td className="px-4 py-3">
                  {page.active ? (
                    <span className="inline-block rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs text-primary">Yayında</span>
                  ) : (
                    <span className="inline-block rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 text-xs text-destructive">Taslak</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <ConfirmDeleteButton
                    action={deleteCmsPageAction}
                    hiddenFields={{ id: page.id }}
                    entityName={page.title}
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
