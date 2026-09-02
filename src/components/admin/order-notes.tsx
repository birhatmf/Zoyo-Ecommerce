"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  addOrderNoteAction,
  deleteOrderNoteAction,
  toggleOrderNoteAction,
  updateOrderNoteAction,
} from "@/app/admin/(panel)/orders/actions";

export type OrderNoteItem = {
  id: string;
  content: string;
  done: boolean;
};

export function OrderNotes({
  orderId,
  notes,
  templates = [],
}: {
  orderId: string;
  notes: OrderNoteItem[];
  templates?: string[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const hasTemplate = (content: string) =>
    notes.some((n) => n.content === content);

  return (
    <section className="rounded-md border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Yönetici Maddeleri &amp; Notlar</h2>
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Hızlı Şablonlar
        </button>
      </div>

      {showTemplates && (
        <div className="mt-3 print:hidden">
          {templates.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Şablon yok.{" "}
              <Link
                href="/admin/settings/order-notes"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Ayarlardan ekleyin.
              </Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <form key={template} action={addOrderNoteAction}>
                  <input type="hidden" name="orderId" value={orderId} />
                  <input type="hidden" name="content" value={template} />
                  <button
                    type="submit"
                    disabled={hasTemplate(template)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
                  >
                    + {template}
                  </button>
                </form>
              ))}
            </div>
          )}
        </div>
      )}

      {notes.length === 0 && !editingId ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Henüz madde eklenmemiş.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {notes.map((note) => (
            <li key={note.id} className="flex items-start gap-3 py-2.5">
              <form action={toggleOrderNoteAction}>
                <input type="hidden" name="noteId" value={note.id} />
                <button
                  type="submit"
                  aria-label={note.done ? "Maddeyi geri al" : "Maddeyi tamamla"}
                  className={`mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                    note.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {note.done && <Check className="size-3" />}
                </button>
              </form>

              {editingId === note.id ? (
                <form
                  action={async (formData) => {
                    await updateOrderNoteAction(formData);
                    setEditingId(null);
                  }}
                  className="flex flex-1 items-start gap-2"
                >
                  <input type="hidden" name="noteId" value={note.id} />
                  <textarea
                    name="content"
                    rows={2}
                    required
                    defaultValue={note.content}
                    autoFocus
                    className="w-full resize-y rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
                  />
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="submit"
                      aria-label="Kaydet"
                      className="rounded p-1.5 text-primary hover:bg-secondary"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="İptal"
                      onClick={() => setEditingId(null)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-secondary"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      note.done ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {note.content}
                  </span>
                  <div className="flex shrink-0 gap-1 print:hidden">
                    <button
                      type="button"
                      aria-label="Düzenle"
                      onClick={() => setEditingId(note.id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <form action={deleteOrderNoteAction}>
                      <input type="hidden" name="noteId" value={note.id} />
                      <button
                        type="submit"
                        aria-label="Sil"
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <form action={addOrderNoteAction} className="mt-4 flex gap-2 print:hidden">
        <input type="hidden" name="orderId" value={orderId} />
        <input
          name="content"
          required
          maxLength={1000}
          placeholder="Yeni madde veya not ekle…"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
        />
        <button
          type="submit"
          aria-label="Madde ekle"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Plus className="size-4" />
        </button>
      </form>
    </section>
  );
}
