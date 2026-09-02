"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  quantity: number;
};

const STORAGE_KEY = "zoyo-cart-v1";
const MAX_QUANTITY = 99;
const EMPTY: CartItem[] = [];

// localStorage kaydedilemediğinde UI'da gösterilecek mesaj için abone listesi.
// Bu, sepetin sadece bellekte yaşadığını ve sayfa yenilenince kaybolacağını
// kullanıcıya bildirmek için kullanılır.
type StorageWarning = { reason: "quota" | "unavailable" };
const storageWarningListeners = new Set<(w: StorageWarning | null) => void>();
let currentWarning: StorageWarning | null = null;

let snapshot: CartItem[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function setStorageWarning(w: StorageWarning | null) {
  if (currentWarning === w) return;
  currentWarning = w;
  storageWarningListeners.forEach((listener) => listener(w));
}

export function useCartStorageWarning(): StorageWarning | null {
  return useSyncExternalStore(
    (cb) => {
      storageWarningListeners.add(cb);
      return () => storageWarningListeners.delete(cb);
    },
    () => currentWarning,
    () => null,
  );
}

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is CartItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as CartItem).productId === "string" &&
          typeof (item as CartItem).quantity === "number" &&
          Number.isInteger((item as CartItem).quantity) &&
          (item as CartItem).quantity > 0,
      )
      .map((item) => ({
        productId: item.productId,
        quantity: Math.min(item.quantity, MAX_QUANTITY),
      }));
  } catch {
    return [];
  }
}

function ensureInitialized() {
  if (!initialized && typeof window !== "undefined") {
    snapshot = readStorage();
    initialized = true;
  }
}

function commit(next: CartItem[]) {
  snapshot = next;
  initialized = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Başarılı yazıldıysa uyarıyı temizle.
    setStorageWarning(null);
  } catch (error) {
    // QuotaExceededError veya güvenlik kısıtlaması (private mode vb.).
    // Sepet yalnızca bellekte yaşar; sayfa yenilenince kaybolur.
    const reason: StorageWarning["reason"] =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ? "quota"
        : "unavailable";
    setStorageWarning({ reason });
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureInitialized();
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY;
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount(): number {
  return useCart().reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(productId: string, quantity = 1) {
  ensureInitialized();
  const existing = snapshot.find((item) => item.productId === productId);
  if (existing) {
    commit(
      snapshot.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) }
          : item,
      ),
    );
  } else {
    commit([...snapshot, { productId, quantity: Math.min(MAX_QUANTITY, quantity) }]);
  }
}

export function setQuantity(productId: string, quantity: number) {
  ensureInitialized();
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  commit(
    snapshot.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) }
        : item,
    ),
  );
}

export function removeFromCart(productId: string) {
  ensureInitialized();
  commit(snapshot.filter((item) => item.productId !== productId));
}

export function clearCart() {
  commit([]);
}
