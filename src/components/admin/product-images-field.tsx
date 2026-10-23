"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Link2,
  Star,
  Upload,
  X,
} from "lucide-react";

// storage.ts ile aynı limitler — kullanıcı yüklemeden önce hata görsün.
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_IMAGES = 20;

export type ProductImageInput = {
  id: string;
  url: string;
  altText: string | null;
  isCover: boolean;
};

type Item =
  | { uid: string; kind: "existing"; id: string; url: string; altText: string }
  | { uid: string; kind: "new"; file: File; url: string; altText: string }
  | { uid: string; kind: "url"; url: string; altText: string };

function makeUid(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `img-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function ProductImagesField({
  initialImages = [],
  productName,
}: {
  initialImages?: ProductImageInput[];
  productName?: string;
}) {
  const { pending } = useFormStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<Item[]>(() =>
    initialImages.map((image) => ({
      uid: image.id,
      kind: "existing" as const,
      id: image.id,
      url: image.url,
      altText: image.altText ?? "",
    })),
  );
  const [coverUid, setCoverUid] = useState<string | null>(() => {
    const cover = initialImages.find((image) => image.isCover);
    return cover?.id ?? initialImages[0]?.id ?? null;
  });
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragUid, setDragUid] = useState<string | null>(null);
  const [urlOpen, setUrlOpen] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [urlAlt, setUrlAlt] = useState("");

  const newItems = useMemo(
    () =>
      items.filter(
        (item): item is Extract<Item, { kind: "new" }> => item.kind === "new",
      ),
    [items],
  );

  // Seçilen dosyaları sıralı biçimde gizli input'a yansıt; böylece FormData
  // dosyaları ekranda görünen sırayla taşır.
  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    for (const item of newItems) transfer.items.add(item.file);
    input.files = transfer.files;
  }, [newItems]);

  // Bileşen kaldırılırken oluşturulan object URL'leri serbest bırak.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => {
      for (const item of itemsRef.current) {
        if (item.kind === "new") URL.revokeObjectURL(item.url);
      }
    },
    [],
  );

  const coverIndex = items.findIndex((item) => item.uid === coverUid);

  const planJson = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => {
          if (item.kind === "existing") return { t: "e", id: item.id, alt: item.altText };
          if (item.kind === "new") return { t: "n", alt: item.altText };
          return { t: "u", url: item.url, alt: item.altText };
        }),
      ),
    [items],
  );

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    if (incoming.length === 0) return;

    const messages: string[] = [];
    const accepted: Item[] = [];
    const room = MAX_IMAGES - items.length;

    for (const file of incoming) {
      if (!ACCEPT.split(",").includes(file.type)) {
        messages.push("Desteklenmeyen dosya türü (JPEG, PNG, WebP, AVIF)");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        messages.push("Dosya boyutu en fazla 10MB olabilir");
        continue;
      }
      if (accepted.length >= room) {
        messages.push(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz`);
        break;
      }
      accepted.push({
        uid: makeUid(),
        kind: "new",
        file,
        url: URL.createObjectURL(file),
        altText: "",
      });
    }

    if (accepted.length > 0) {
      setItems((prev) => [...prev, ...accepted]);
      setCoverUid((prev) => prev ?? accepted[0].uid);
    }
    setError(messages[0] ?? null);
  }

  function removeItem(uid: string) {
    const target = items.find((item) => item.uid === uid);
    if (!target) return;

    if (target.kind === "new") URL.revokeObjectURL(target.url);
    if (target.kind === "existing") {
      setRemovedIds((prev) => (prev.includes(target.id) ? prev : [...prev, target.id]));
    }

    const remaining = items.filter((item) => item.uid !== uid);
    setItems(remaining);
    if (coverUid === uid) setCoverUid(remaining[0]?.uid ?? null);
  }

  function moveItem(uid: string, delta: number) {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.uid === uid);
      const next = index + delta;
      if (index === -1 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(next, 0, moved);
      return copy;
    });
  }

  function reorder(fromUid: string, toUid: string) {
    if (fromUid === toUid) return;
    setItems((prev) => {
      const from = prev.findIndex((item) => item.uid === fromUid);
      const to = prev.findIndex((item) => item.uid === toUid);
      if (from === -1 || to === -1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  }

  function updateAlt(uid: string, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, altText: value } : item)),
    );
  }

  function addUrl() {
    const value = urlValue.trim();
    if (!value) return;
    if (items.length >= MAX_IMAGES) {
      setError(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz`);
      return;
    }
    const uid = makeUid();
    setItems((prev) => [
      ...prev,
      { uid, kind: "url", url: value, altText: urlAlt.trim() },
    ]);
    setCoverUid((prev) => prev ?? uid);
    setUrlValue("");
    setUrlAlt("");
    setUrlOpen(false);
    setError(null);
  }

  function handleDrop(event: React.DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    setIsDragOver(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <input type="hidden" name="imagePlan" value={planJson} />
      <input type="hidden" name="coverIndex" value={String(coverIndex)} />
      <input type="hidden" name="removeImageIds" value={JSON.stringify(removedIds)} />
      <input
        ref={fileInputRef}
        type="file"
        name="images"
        multiple
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            addFiles(event.target.files);
          }
          // Aynı dosyanın tekrar seçilebilmesi için input temizlenir; dosya
          // listesi state'ten yazılan effect ile yeniden oluşturulur.
          event.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">
            Görseller
            {items.length > 0 && (
              <span className="ml-1 text-muted-foreground">({items.length})</span>
            )}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Kaydet&apos;e basmadan önce sıralayabilir, kapak seçebilir ve
            silebilirsiniz.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending || items.length >= MAX_IMAGES}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <Upload className="size-3.5" />
            Görsel Seç
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setUrlOpen((value) => !value)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <Link2 className="size-3.5" />
            URL ile Ekle
          </button>
        </div>
      </div>

      {urlOpen && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 p-2">
          <input
            value={urlValue}
            onChange={(event) => setUrlValue(event.target.value)}
            placeholder="https://... veya /api/media/..."
            className="h-8 min-w-56 flex-1 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-ring"
          />
          <input
            value={urlAlt}
            onChange={(event) => setUrlAlt(event.target.value)}
            placeholder="Alt metin"
            className="h-8 w-32 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-ring"
          />
          <button
            type="button"
            onClick={addUrl}
            className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted"
          >
            Ekle
          </button>
        </div>
      )}

      <div
        className={`mt-4 rounded-md border border-dashed p-3 transition-colors ${
          isDragOver ? "border-accent bg-accent/5" : "border-border"
        }`}
      >
        {items.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Görsel seçin veya dosyaları buraya sürükleyin (en fazla {MAX_IMAGES}{" "}
            görsel, 10MB).
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item, index) => {
              const isCover = item.uid === coverUid;
              return (
                <li
                  key={item.uid}
                  onDragOver={(event) => {
                    if (event.dataTransfer.types.includes("Files")) return;
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    if (event.dataTransfer.types.includes("Files")) return;
                    event.preventDefault();
                    event.stopPropagation();
                    if (dragUid) reorder(dragUid, item.uid);
                    setDragUid(null);
                  }}
                  className={`rounded-md border p-2 transition-colors ${
                    dragUid === item.uid ? "border-accent opacity-60" : "border-border"
                  }`}
                >
                  <div
                    draggable={!pending}
                    onDragStart={(event) => {
                      setDragUid(item.uid);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDragUid(null)}
                    className="group relative aspect-[4/3] cursor-grab overflow-hidden rounded-sm bg-muted active:cursor-grabbing"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.altText || productName || ""}
                      className="pointer-events-none size-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      <GripVertical className="size-3" />
                      {index + 1}
                    </span>
                    {isCover && (
                      <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                        <Star className="size-3" /> Kapak
                      </span>
                    )}
                    {item.kind === "new" && (
                      <span className="absolute bottom-1.5 right-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                        Yeni
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={pending || index === 0}
                        onClick={() => moveItem(item.uid, -1)}
                        aria-label="Sola taşı"
                        className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                      >
                        <ArrowLeft className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={pending || index === items.length - 1}
                        onClick={() => moveItem(item.uid, 1)}
                        aria-label="Sağa taşı"
                        className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                      >
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={pending || isCover}
                        onClick={() => setCoverUid(item.uid)}
                        aria-label="Kapak yap"
                        aria-pressed={isCover}
                        title="Kapak yap"
                        className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                      >
                        <Star className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => removeItem(item.uid)}
                        aria-label="Görseli kaldır"
                        title="Kaldır"
                        className="inline-flex size-7 items-center justify-center rounded-md border border-border text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-40"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    value={item.altText}
                    onChange={(event) => updateAlt(item.uid, event.target.value)}
                    maxLength={255}
                    placeholder={productName || "Alt metin"}
                    className="mt-2 h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
