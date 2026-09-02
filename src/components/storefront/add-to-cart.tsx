"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";

import { addToCart } from "@/lib/cart";

export function AddToCart({ productId }: { productId: string }) {
  const [quantity, setQuantityLocal] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(productId, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex h-11 items-center rounded-md border border-border">
        <button
          type="button"
          onClick={() => setQuantityLocal((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Miktarı azalt"
          className="inline-flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span aria-live="polite" className="w-8 text-center text-sm font-medium">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantityLocal((q) => Math.min(99, q + 1))}
          aria-label="Miktarı artır"
          className="inline-flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 sm:flex-none sm:px-10"
      >
        {added ? (
          <>
            <Check className="size-4" />
            Sepete Eklendi
          </>
        ) : (
          "Sepete Ekle"
        )}
      </button>
      {added && (
        <Link
          href="/sepet"
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          Sepete Git
        </Link>
      )}
    </div>
  );
}
