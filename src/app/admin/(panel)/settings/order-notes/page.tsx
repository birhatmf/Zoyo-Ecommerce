import type { Metadata } from "next";
import Link from "next/link";

import { OrderNoteTemplatesForm } from "@/components/admin/order-note-templates-form";
import { getOrderNoteTemplatesWithIds } from "@/lib/order";

export const metadata: Metadata = { title: "Sipariş Maddeleri" };

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
      <h1 className="mt-1 font-heading text-xl font-medium">Sipariş Maddeleri</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Checkout ekranında müşteriye gösterilen ve sipariş detayında hızlı ekleme
        şablonu olarak kullanılan maddeler.
      </p>
      <div className="mt-6">
        <OrderNoteTemplatesForm templates={templates} />
      </div>
    </div>
  );
}
