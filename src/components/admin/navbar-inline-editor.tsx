"use client";

import { useState } from "react";
import { Plus, ShoppingBag, Trash2, X } from "lucide-react";

import {
  deleteHeaderLinkAction,
  saveHeaderLinkAction,
} from "@/app/admin/(panel)/content/actions";
import { InlineEditable } from "@/components/admin/inline-editable";

export type NavbarLinkItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
};

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring";

// Navbar'ın birebir görünümünü taklit eden canlı düzenleme paneli.
// Link etiketleri contentEditable; blur'da kaydedilir. Link ekleme/silme
// ayrı kontrollerle yapılır.
export function NavbarInlineEditor({
  links,
  siteName,
  categories = [],
}: {
  links: NavbarLinkItem[];
  siteName: string;
  categories?: { name: string; slug: string }[];
}) {
  const [adding, setAdding] = useState(false);

  const sorted = [...links].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Canlı Önizleme — link etiketine tıklayıp düzenleyin
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Otomatik kaydedilir
        </span>
      </div>

      {/* Navbar önizlemesi */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <span className="font-heading text-xl font-medium tracking-[0.18em] uppercase">
            {siteName}
          </span>
          <nav className="flex items-center gap-8" aria-label="Ana menü önizleme">
            {sorted.map((link) => (
              <span key={link.id} className="group relative flex items-center gap-1">
                <InlineEditable
                  action={saveHeaderLinkAction}
                  fieldName="label"
                  valueField="label"
                  value={link.label}
                  hiddenFields={{
                    id: link.id,
                    href: link.href,
                    sortOrder: String(link.sortOrder),
                  }}
                  className="text-sm text-muted-foreground"
                />
                <button
                  type="button"
                  aria-label={`${link.label} linkini sil`}
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("id", link.id);
                    void deleteHeaderLinkAction(fd);
                  }}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            ))}
            {sorted.length === 0 && (
              <span className="text-sm text-muted-foreground">
                Varsayılan menü gösteriliyor
              </span>
            )}
          </nav>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" aria-hidden="true">
            <ShoppingBag className="size-4" />
            Sepet
          </span>
        </div>

        {/* Kategori şeridi — kategori adları navbar'da görünen dinamik bölüm */}
        {categories.length > 0 && (
          <div className="border-t border-border/60 bg-secondary/30">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 sm:px-6">
              <span className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                Kategoriler
              </span>
              {categories.map((c) => (
                <span key={c.slug} className="text-xs text-muted-foreground">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Link ekleme */}
      <div className="border-t border-border bg-card p-4">
        {adding ? (
          <form
            action={async (formData) => {
              await saveHeaderLinkAction(formData);
              setAdding(false);
            }}
            className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto]"
          >
            <label className="block">
              <span className="mb-1 block text-xs text-muted-foreground">Etiket *</span>
              <input name="label" required maxLength={100} placeholder="Koleksiyonlar" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted-foreground">Hedef *</span>
              <input name="href" required maxLength={500} placeholder="/kategori/masa" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-muted-foreground">Sıra</span>
              <input name="sortOrder" type="number" min="0" max="999" defaultValue={sorted.length} className={inputClass} />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="button"
                aria-label="İptal"
                onClick={() => setAdding(false)}
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/85"
              >
                Ekle
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/85"
          >
            <Plus className="size-4" />
            Link Ekle
          </button>
        )}
      </div>
    </div>
  );
}
