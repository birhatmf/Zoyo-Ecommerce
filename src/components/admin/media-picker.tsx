"use client";

import { useState } from "react";
import { Images, X } from "lucide-react";

import { listMediaForPickerAction } from "@/app/admin/(panel)/media/picker-action";

// Medya kütüphanesinden görsel seçme dialog'u.
// onSelect: seçilen görselin URL'ini geri verir.
export function MediaPicker({
  onSelect,
  triggerLabel = "Kütüphaneden Seç",
}: {
  onSelect: (url: string) => void;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ id: string; url: string; fileName: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function openPicker() {
    setOpen(true);
    setLoading(true);
    const result = await listMediaForPickerAction();
    setItems(result);
    setLoading(false);
  }

  function choose(url: string) {
    onSelect(url);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted"
      >
        <Images className="size-3.5" />
        {triggerLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Medya seç"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-md border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Medya Kütüphanesi</h2>
              <button
                type="button"
                aria-label="Kapat"
                onClick={() => setOpen(false)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Yükleniyor...</p>
              ) : items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Henüz medya yok. Önce bir görsel yükleyin.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => choose(item.url)}
                      title={item.fileName}
                      className="group overflow-hidden rounded-md border border-border transition-colors hover:border-accent"
                    >
                      <div className="relative aspect-square w-full bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.fileName}
                          className="size-full object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
