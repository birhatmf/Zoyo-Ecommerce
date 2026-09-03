"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckSquare, Square } from "lucide-react";

import { bulkProductAction } from "@/app/admin/(panel)/products/actions";
import { formatPrice } from "@/lib/format";

export type ProductRow = {
  id: string;
  name: string;
  productCode: string;
  featured: boolean;
  price: { toString(): string };
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  categoryName: string | null;
  coverUrl: string | null;
};

export type BulkCategoryOption = { id: string; name: string };

const STATUS_LABELS = { DRAFT: "Taslak", ACTIVE: "Yayında", INACTIVE: "Pasif" } as const;
const STATUS_CLASSES = {
  DRAFT: "border-border text-muted-foreground",
  ACTIVE: "border-transparent bg-primary/10 text-primary",
  INACTIVE: "border-destructive/20 bg-destructive/5 text-destructive",
} as const;

export function ProductTable({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: BulkCategoryOption[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [busy, setBusy] = useState(false);

  const allChecked = products.length > 0 && products.every((p) => selected.has(p.id));

  function toggleAll() {
    setSelected((prev) => {
      if (products.every((p) => prev.has(p.id))) {
        const next = new Set(prev);
        products.forEach((p) => next.delete(p.id));
        return next;
      }
      const next = new Set(prev);
      products.forEach((p) => next.add(p.id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk() {
    if (selected.size === 0 || !bulkAction) return;
    if (bulkAction === "set-category" && !categoryId) return;

    setBusy(true);
    const fd = new FormData();
    selected.forEach((id) => fd.append("ids", id));
    fd.set("bulkAction", bulkAction);
    if (categoryId) fd.set("categoryId", categoryId);
    try {
      await bulkProductAction(fd);
      setSelected(new Set());
      setBulkAction("");
      setCategoryId("");
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Toplu işlem çubuğu */}
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-accent/40 bg-accent/5 px-3 py-2">
          <span className="text-xs font-medium text-accent">
            {selected.size} ürün seçildi
          </span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring"
            aria-label="Toplu işlem"
          >
            <option value="">İşlem seç…</option>
            <option value="activate">Yayınla</option>
            <option value="deactivate">Pasife al</option>
            <option value="set-category">Kategori ata</option>
          </select>
          {bulkAction === "set-category" && (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring"
              aria-label="Hedef kategori"
            >
              <option value="">Kategori seç…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            disabled={busy || (bulkAction === "set-category" && !categoryId)}
            onClick={runBulk}
            className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
          >
            {busy ? "Uygulanıyor..." : "Uygula"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Vazgeç
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="w-10 px-3 py-3">
                <button
                  type="button"
                  onClick={toggleAll}
                  aria-label={allChecked ? "Tümünü seçimi kaldır" : "Tümünü seç"}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {allChecked ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Görsel</th>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Kod</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Kategori</th>
              <th className="px-4 py-3 font-medium">Fiyat</th>
              <th className="px-4 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
            {products.map((product) => {
              const checked = selected.has(product.id);
              return (
                <tr
                  key={product.id}
                  className={`border-b border-border last:border-b-0 ${
                    checked ? "bg-accent/5" : "hover:bg-muted/40"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleOne(product.id)}
                      aria-label={`${product.name} seç`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {checked ? <CheckSquare className="size-4 text-accent" /> : <Square className="size-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    {product.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.coverUrl}
                        alt=""
                        className="size-10 rounded-sm object-cover"
                      />
                    ) : (
                      <span className="block size-10 rounded-sm bg-muted" />
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {product.name}
                      {product.featured && (
                        <span title="Öne çıkan" className="ml-1.5 text-xs text-accent">★</span>
                      )}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">{product.productCode}</td>
                  <td className="hidden px-4 py-2.5 text-muted-foreground lg:table-cell">{product.categoryName ?? "—"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{formatPrice(product.price)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${STATUS_CLASSES[product.status]}`}>
                      {STATUS_LABELS[product.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
