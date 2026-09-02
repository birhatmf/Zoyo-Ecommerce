"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Upload, X } from "lucide-react";

// storage.ts ile aynı limitler — kullanıcı yüklemeden önce hata görsün.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

function isAllowedType(file: File): boolean {
  return ACCEPT.split(",").includes(file.type);
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function resetPreview() {
    setPreview(null);
    setClientError(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setClientError(null);

    if (!isAllowedType(file)) {
      setClientError("Desteklenmeyen dosya türü (JPEG, PNG, WebP, AVIF)");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setClientError("Dosya boyutu en fazla 5MB olabilir");
      event.target.value = "";
      return;
    }

    // Önizleme oluştur
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPendingFile(file);

    // Formu otomatik gönder (auto-submit)
    event.target.form?.requestSubmit();
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={action} className="contents">
        {hiddenFields &&
          Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        <SubmitButton fileInputRef={fileInputRef} onChange={handleChange} />
      </form>

      {preview && pendingFile && (
        <PreviewCard
          url={preview}
          file={pendingFile}
          onClear={resetPreview}
        />
      )}

      {clientError && (
        <p
          role="alert"
          className="text-xs text-destructive"
          aria-live="polite"
        >
          {clientError}
        </p>
      )}
    </div>
  );
}

function SubmitButton({
  fileInputRef,
  onChange,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
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
      {pending ? "Yükleniyor…" : "Görsel Seç"}
      <input
        ref={fileInputRef}
        type="file"
        name="file"
        required
        accept={ACCEPT}
        className="sr-only"
        onChange={onChange}
      />
    </label>
  );
}

function PreviewCard({
  url,
  file,
  onClear,
}: {
  url: string;
  file: File;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-2">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={file.name}
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 text-xs">
        <p className="truncate font-medium">{file.name}</p>
        <p className="text-muted-foreground">
          {(file.size / 1024).toFixed(0)} KB · {file.type.replace("image/", "")}
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label="Önizlemeyi kaldır"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
