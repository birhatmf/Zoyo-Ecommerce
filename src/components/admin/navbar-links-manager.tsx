"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import {
  deleteHeaderLinkAction,
  saveHeaderLinkAction,
} from "@/app/admin/(panel)/content/actions";

export type HeaderLinkItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
};

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring";
const labelClass = "mb-1 block text-xs text-muted-foreground";

export function NavbarLinksManager({ links }: { links: HeaderLinkItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {links.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          Link tanımlanmamış. Tanım yoksa varsayılan menü (Ürünler, Hakkımızda,
          İletişim) gösterilir.
        </p>
      )}

      <ul className="divide-y divide-border rounded-md border border-border bg-card">
        {links.map((link) =>
          editingId === link.id ? (
            <li key={link.id} className="p-4">
              <LinkFields link={link} onDone={() => setEditingId(null)} />
            </li>
          ) : (
            <li key={link.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-8 shrink-0 text-xs text-muted-foreground tabular-nums">
                #{link.sortOrder}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{link.label}</p>
                <p className="truncate text-xs text-muted-foreground">{link.href}</p>
              </div>
              <button
                type="button"
                aria-label="Düzenle"
                onClick={() => setEditingId(link.id)}
                className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </button>
              <form action={deleteHeaderLinkAction}>
                <input type="hidden" name="id" value={link.id} />
                <button
                  type="submit"
                  aria-label="Sil"
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </form>
            </li>
          ),
        )}
      </ul>

      {adding ? (
        <div className="rounded-md border border-accent/40 bg-card p-4">
          <LinkFields link={null} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Plus className="size-4" />
          Link Ekle
        </button>
      )}
    </div>
  );
}

function LinkFields({
  link,
  onDone,
}: {
  link: HeaderLinkItem | null;
  onDone: () => void;
}) {
  return (
    <form
      action={async (formData) => {
        await saveHeaderLinkAction(formData);
        onDone();
      }}
      className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto]"
    >
      {link && <input type="hidden" name="id" value={link.id} />}
      <label className="block">
        <span className={labelClass}>Etiket *</span>
        <input
          name="label"
          required
          maxLength={100}
          defaultValue={link?.label ?? ""}
          placeholder="Koleksiyonlar"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Hedef *</span>
        <input
          name="href"
          required
          maxLength={500}
          defaultValue={link?.href ?? ""}
          placeholder="/kategori/masa veya https://..."
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Sıra</span>
        <input
          name="sortOrder"
          type="number"
          min="0"
          max="999"
          defaultValue={link?.sortOrder ?? 0}
          className={inputClass}
        />
      </label>
      <div className="flex items-end gap-2">
        <button
          type="button"
          aria-label="İptal"
          onClick={onDone}
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Kaydet
        </button>
      </div>
    </form>
  );
}
