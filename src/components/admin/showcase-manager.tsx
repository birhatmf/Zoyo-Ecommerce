"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import {
  addShowcaseProductAction,
  moveShowcaseProductAction,
  removeShowcaseProductAction,
} from "@/app/admin/(panel)/content/actions";

export type ShowcaseItem = {
  id: string;
  productId: string;
  name: string;
  coverUrl: string | null;
};

export type ShowcaseOption = { id: string; name: string };

const iconButton =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent";

export function ShowcaseManager({
  items,
  options,
}: {
  items: ShowcaseItem[];
  options: ShowcaseOption[];
}) {
  return (
    <div className="space-y-5">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Henüz vitrin ürünü eklenmemiş. Aşağıdan ürün ekleyin; ana sayfada
          büyük, dönüşümlü satırlar olarak gösterilir.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
            >
              {item.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <span className="block size-12 shrink-0 rounded-sm bg-muted" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                <span className="text-muted-foreground">{index + 1}.</span> {item.name}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <form action={moveShowcaseProductAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Yukarı taşı"
                    className={iconButton}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                </form>
                <form action={moveShowcaseProductAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === items.length - 1}
                    aria-label="Aşağı taşı"
                    className={iconButton}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </form>
                <form action={removeShowcaseProductAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    aria-label="Kaldır"
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {options.length > 0 ? (
        <form
          action={addShowcaseProductAction}
          className="flex flex-wrap items-center gap-2"
        >
          <select
            name="productId"
            required
            defaultValue=""
            aria-label="Vitrine eklenecek ürün"
            className="h-9 min-w-56 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
          >
            <option value="" disabled>
              Ürün seç…
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Plus className="size-4" />
            Ürün Ekle
          </button>
        </form>
      ) : (
        items.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Eklenebilecek başka yayında ürün yok.
          </p>
        )
      )}
    </div>
  );
}
