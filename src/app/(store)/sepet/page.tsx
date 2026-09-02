import type { Metadata } from "next";

import { CartView } from "@/components/storefront/cart-view";

export const metadata: Metadata = {
  title: "Sepet",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-heading text-3xl font-medium sm:text-4xl">Sepet</h1>
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
