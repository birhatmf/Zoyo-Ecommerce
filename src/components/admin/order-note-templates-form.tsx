"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  deleteOrderNoteTemplateAction,
  saveOrderNoteTemplateAction,
} from "@/app/admin/(panel)/settings/actions";

export type OrderNoteTemplate = {
  id: string;
  content: string;
};

export function OrderNoteTemplatesForm({
  templates,
}: {
  templates: OrderNoteTemplate[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  return (
    <div className="max-w-3xl">
      {templates.length === 0 && !editingId ? (
        <p className="text-sm text-muted-foreground">
          Henüz madde şablonu eklenmemiş. Aşağıdan yeni madde ekleyebilirsiniz.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {templates.map((template) => (
            <li key={template.id} className="flex items-start gap-3 px-4 py-3">
              {editingId === template.id ? (
                <form
                  action={async (formData) => {
                    setFormError("");
                    const result = await saveOrderNoteTemplateAction(
                      {},
                      formData,
                    );
                    if (result.error) {
                      setFormError(result.error);
                      return;
                    }
                    setEditingId(null);
                  }}
                  className="flex flex-1 items-start gap-2"
                >
                  <input type="hidden" name="templateId" value={template.id} />
                  <textarea
                    name="content"
                    rows={2}
                    required
                    maxLength={500}
                    defaultValue={template.content}
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
                  <span className="flex-1 text-sm">{template.content}</span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="Düzenle"
                      onClick={() => setEditingId(template.id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <form action={deleteOrderNoteTemplateAction}>
                      <input type="hidden" name="templateId" value={template.id} />
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

      {formError && (
        <p role="alert" className="mt-2 text-xs text-destructive">{formError}</p>
      )}

      <form
        action={async (formData) => {
          setFormError("");
          const result = await saveOrderNoteTemplateAction({}, formData);
          if (result.error) {
            setFormError(result.error);
            return;
          }
          (document.getElementById("new-template-form") as HTMLFormElement)?.reset();
        }}
        id="new-template-form"
        className="mt-4 flex gap-2"
      >
        <input
          name="content"
          required
          maxLength={500}
          placeholder="Yeni madde şablonu…"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
        />
        <button
          type="submit"
          aria-label="Şablon ekle"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Plus className="size-4" />
          Ekle
        </button>
      </form>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Bu maddeler checkout (sipariş oluşturma) sayfasında müşteriye gösterilir ve
        sipariş detayında hızlı ekleme şablonu olarak kullanılır.
      </p>
    </div>
  );
}
