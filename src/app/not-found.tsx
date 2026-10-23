import type { Metadata } from "next";

import { NotFoundContent } from "@/components/storefront/not-found-content";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center">
      <NotFoundContent />
    </main>
  );
}
