"use client";

import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/lib/cart";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  discountPrice: string | null;
  imageUrl: string | null;
};

export function effectivePrice(product: {
  price: string;
  discountPrice: string | null;
}): number {
  return product.discountPrice !== null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < Number(product.price)
    ? Number(product.discountPrice)
    : Number(product.price);
}

export function useCartProducts() {
  const cart = useCart();
  const [fetched, setFetched] = useState<{
    key: string;
    products: CartProduct[];
  } | null>(null);

  const key = useMemo(
    () => cart.map((item) => item.productId).sort().join(","),
    [cart],
  );

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: key.split(",") }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Sepet bilgileri alınamadı");
        const data = await response.json();
        if (!cancelled) setFetched({ key, products: data.products });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key, products: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const isLoading = cart.length > 0 && fetched?.key !== key;
  const products = fetched?.key === key ? fetched.products : [];

  return { cart, products, isLoading };
}
