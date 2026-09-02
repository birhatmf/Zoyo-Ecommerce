"use client";

import { useRef, useState } from "react";
import { Check, MessageCircle, ShoppingBag } from "lucide-react";

import { addToCart } from "@/lib/cart";

// Mobilde ekran altında sabit eylem çubuğu (PRD §58).
// Ekranı kaplamaması için yalnızca sepete ekle + WhatsApp içerir.
export function MobileActionBar({
  productId,
  waLink,
}: {
  productId: string;
  waLink?: string | null;
}) {
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAdd() {
    addToCart(productId, 1);
    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp'tan bilgi al"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="size-5" />
          </a>
        )}
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          {added ? (
            <>
              <Check className="size-4" />
              Sepete Eklendi
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              Sepete Ekle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
