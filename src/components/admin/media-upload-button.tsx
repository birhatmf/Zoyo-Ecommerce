"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Upload } from "lucide-react";

// Yükleme butonu bağımsız bir mini formdur; ana formun içinde değil
// kardeşi olarak render edilir (form-içinde-form geçersizdir).
// Dosya seçildiği an ilgili server action'a gönderilir.
export function MediaUploadButton({
  action,
  hiddenFields,
}: {
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string>;
}) {
  return (
    <form action={action} className="contents">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <label
      className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors ${
        pending
          ? "pointer-events-none border-border bg-muted text-muted-foreground"
          : "border-border hover:bg-muted"
      }`}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Upload className="size-3.5" />
      )}
      {pending ? "Yükleniyor…" : "Yükle"}
      <input
        type="file"
        name="file"
        required
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
      />
    </label>
  );
}
