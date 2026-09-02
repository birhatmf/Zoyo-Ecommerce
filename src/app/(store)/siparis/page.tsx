import type { Metadata } from "next";

import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getOrderNoteTemplates } from "@/lib/order";
import { getStorefrontTexts } from "@/lib/storefront-text";

export const metadata: Metadata = {
  title: "Sipariş Oluştur",
};

export default async function CheckoutPage() {
  const [orderNotes, texts] = await Promise.all([
    getOrderNoteTemplates(),
    getStorefrontTexts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-heading text-3xl font-medium sm:text-4xl">
        {texts["checkout.title"]}
      </h1>
      <div className="mt-10">
        <CheckoutForm orderNotes={orderNotes} texts={texts} />
      </div>
    </div>
  );
}
