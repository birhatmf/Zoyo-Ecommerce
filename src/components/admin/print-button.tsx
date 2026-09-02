"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium transition-colors hover:bg-secondary print:hidden"
    >
      <Printer className="size-3.5" />
      Yazdır / PDF
    </button>
  );
}
