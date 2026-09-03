import type { Metadata } from "next";
import Link from "next/link";

import { OrderNoteTemplatesForm } from "@/components/admin/order-note-templates-form";
import { getOrderNoteTemplatesWithIds } from "@/lib/order";

export const metadata: Metadata = { title: "Checkout Maddeleri" };

export default async function AdminOrderNoteTemplatesPage() {
  const templates = await getOrderNoteTemplatesWithIds();

  return (
    <div>
      <Link
        href="/admin/settings"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Ayarlar
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Checkout Maddeleri</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Sipariş formunda müşteriye gösterilen bilgilendirme maddeleri; ayrıca
        sipariş detayında hızlı not şablonu olarak kullanılır.
      </p>
      <div className="mt-6">
        <OrderNoteTemplatesForm templates={templates} />
      </div>
    </div>
  );
}
