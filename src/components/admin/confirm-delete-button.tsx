"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

// Silme gibi geri döndürülemez işlemler için onay isteyen buton.
// Onay "dialog" yerine inline iki aşamalı (tıkla → onayla) kullanılır;
// böylece erişilebilirlik ve basitlik korunur.
export function ConfirmDeleteButton({
  action,
  hiddenFields,
  label = "Sil",
  confirmLabel = "Emin misin? Sil",
  entityName,
}: {
  action: (formData: FormData) => Promise<void>;
  hiddenFields: Record<string, string>;
  label?: string;
  confirmLabel?: string;
  entityName?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-destructive underline-offset-4 hover:underline"
      >
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="inline-flex items-center gap-2">
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <span className="text-xs text-destructive">
        {entityName ? `${entityName} silinsin mi?` : confirmLabel}
      </span>
      <ConfirmSubmit label="Evet" />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Vazgeç
      </button>
    </form>
  );
}

function ConfirmSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "..." : label}
    </button>
  );
}
