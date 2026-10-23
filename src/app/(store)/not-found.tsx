import type { Metadata } from "next";

import { NotFoundContent } from "@/components/storefront/not-found-content";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
};

export default function StoreNotFound() {
  return <NotFoundContent />;
}
