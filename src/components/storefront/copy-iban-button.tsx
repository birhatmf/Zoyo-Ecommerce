"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyIbanButton({ iban }: { iban: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(iban);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = iban;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="size-3.5" />
          Kopyalandı
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          IBAN Kopyala
        </>
      )}
    </button>
  );
}
