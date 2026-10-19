"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsappFloat({
  phone,
  siteName,
}: {
  phone: string;
  siteName: string;
}) {
  const [open, setOpen] = useState(false);
  const digits = phone.replace(/\D/g, "");
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
    "Merhaba, bilgi almak istiyorum.",
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div
          role="dialog"
          aria-label="WhatsApp iletişim"
          className="w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        >
          <div className="flex items-center gap-3 bg-[#25D366] px-4 py-3 text-white">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{siteName}</p>
              <p className="text-xs text-white/80">Genellikle birkaç dakikada yanıtlar</p>
            </div>
          </div>
          <div className="p-4">
            <p className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground">
              Merhaba! Size nasıl yardımcı olabiliriz? Ürünler, sipariş veya üretim
              süreci hakkında yazabilirsiniz.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-10 items-center justify-center gap-2 rounded-md bg-[#25D366] text-sm font-medium text-white transition-colors hover:bg-[#1ebe5b]"
            >
              <MessageCircle className="size-4" />
              Sohbeti başlat
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "WhatsApp penceresini kapat" : "WhatsApp ile iletişime geç"}
        aria-expanded={open}
        className="flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
