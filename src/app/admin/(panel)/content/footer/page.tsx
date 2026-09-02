import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import {
  deleteFooterGroupAction,
  deleteFooterLinkAction,
  saveFooterCopyrightAction,
  saveFooterGroupAction,
  saveFooterLinkAction,
} from "@/app/admin/(panel)/content/actions";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Footer Yönetimi" };

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring";

export default async function AdminFooterContentPage() {
  const [groups, settings] = await Promise.all([
    prisma.footerLinkGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: { links: { orderBy: { sortOrder: "asc" } } },
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/content"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← İçerik
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Footer Yönetimi</h1>

      {/* Copyright */}
      <form
        action={saveFooterCopyrightAction}
        className="mt-6 flex items-end gap-3 rounded-md border border-border bg-card p-5"
      >
        <label className="flex-1">
          <span className="mb-1.5 block text-sm text-muted-foreground">Copyright Metni</span>
          <input
            name="footerCopyright"
            defaultValue={settings.footerCopyright ?? ""}
            placeholder={`© ${new Date().getFullYear()} Zoyo Mobilya. Tüm hakları saklıdır.`}
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Kaydet
        </button>
      </form>

      {/* Link grupları */}
      <div className="mt-8 space-y-6">
        {groups.map((group) => (
          <section key={group.id} className="rounded-md border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{group.title}</span>
                <span className="text-xs text-muted-foreground">(sıra {group.sortOrder})</span>
              </div>
              <form action={deleteFooterGroupAction}>
                <input type="hidden" name="id" value={group.id} />
                <button
                  type="submit"
                  aria-label={`${group.title} grubunu sil`}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>

            <div className="mt-4 space-y-2">
              {group.links.map((link) => (
                <div key={link.id} className="flex flex-wrap items-center gap-2">
                  <form action={saveFooterLinkAction} className="flex flex-1 flex-wrap items-center gap-2">
                    <input type="hidden" name="groupId" value={group.id} />
                    <input type="hidden" name="linkId" value={link.id} />
                    <input name="label" defaultValue={link.label} aria-label="Etiket" className={`${inputClass} w-44`} />
                    <input name="url" defaultValue={link.url} aria-label="URL" className={`${inputClass} min-w-40 flex-1`} />
                    <input
                      name="sortOrder"
                      type="number"
                      min="0"
                      max="999"
                      defaultValue={link.sortOrder}
                      aria-label="Sıra"
                      className={`${inputClass} w-16`}
                    />
                    <button
                      type="submit"
                      className="h-9 rounded-md border border-border px-3 text-xs transition-colors hover:bg-muted"
                    >
                      Güncelle
                    </button>
                  </form>
                  <form action={deleteFooterLinkAction}>
                    <input type="hidden" name="linkId" value={link.id} />
                    <button
                      type="submit"
                      aria-label={`${link.label} linkini sil`}
                      className="p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </form>
                </div>
              ))}
            </div>

            {/* Yeni link */}
            <form action={saveFooterLinkAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <input type="hidden" name="groupId" value={group.id} />
              <input name="label" required placeholder="Yeni etiket" className={`${inputClass} w-44`} />
              <input name="url" required placeholder="/kvkk veya https://..." className={`${inputClass} min-w-40 flex-1`} />
              <input
                name="sortOrder"
                type="number"
                min="0"
                max="999"
                defaultValue={group.links.length}
                aria-label="Sıra"
                className={`${inputClass} w-16`}
              />
              <button
                type="submit"
                className="h-9 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted"
              >
                + Link Ekle
              </button>
            </form>
          </section>
        ))}

        {/* Yeni grup */}
        <details className="rounded-md border border-dashed border-border p-5">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            + Yeni Link Grubu
          </summary>
          <form action={saveFooterGroupAction} className="mt-4 flex flex-wrap items-center gap-2">
            <input name="title" required placeholder="Grup adı (örn. Kurumsal)" className={`${inputClass} w-64`} />
            <input
              name="sortOrder"
              type="number"
              min="0"
              max="999"
              defaultValue={groups.length}
              aria-label="Sıra"
              className={`${inputClass} w-16`}
            />
            <button
              type="submit"
              className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Oluştur
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}
