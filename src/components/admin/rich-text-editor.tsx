"use client";

import { useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

// Hafif zengin metin editörü (contentEditable + execCommand).
// Çıktı yine HTML'dir; kayıt sonrası server tarafında sanitize-html ile
// temizlenir (src/lib/cms.ts) — stored-XSS koruması korunur.
export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }

  function makeLink() {
    const url = window.prompt("Link adresi:", "https://");
    if (url) exec("createLink", url);
  }

  const btn =
    "inline-flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div className="rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        <button type="button" title="Kalın" aria-label="Kalın" onClick={() => exec("bold")} className={btn}>
          <Bold className="size-3.5" />
        </button>
        <button type="button" title="İtalik" aria-label="İtalik" onClick={() => exec("italic")} className={btn}>
          <Italic className="size-3.5" />
        </button>
        <button type="button" title="Altı çizili" aria-label="Altı çizili" onClick={() => exec("underline")} className={btn}>
          <Underline className="size-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <button type="button" title="Başlık 2" aria-label="Başlık 2" onClick={() => exec("formatBlock", "h2")} className={btn}>
          <Heading2 className="size-3.5" />
        </button>
        <button type="button" title="Başlık 3" aria-label="Başlık 3" onClick={() => exec("formatBlock", "h3")} className={btn}>
          <Heading3 className="size-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <button type="button" title="Madde listesi" aria-label="Madde listesi" onClick={() => exec("insertUnorderedList")} className={btn}>
          <List className="size-3.5" />
        </button>
        <button type="button" title="Numaralı liste" aria-label="Numaralı liste" onClick={() => exec("insertOrderedList")} className={btn}>
          <ListOrdered className="size-3.5" />
        </button>
        <button type="button" title="Link ekle" aria-label="Link ekle" onClick={makeLink} className={btn}>
          <Link2 className="size-3.5" />
        </button>
      </div>

      {/* İçerik — contentEditable; form submit'te gizli input'a kopyalanır */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="prose-sm max-h-[500px] min-h-48 resize-y overflow-y-auto px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/40 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
        dangerouslySetInnerHTML={{ __html: defaultValue }}
      />

      {/* Form submit için gizli alan — editor'ün HTML'ini taşır */}
      <input type="hidden" name={name} id={`rich-${name}`} />
    </div>
  );
}

// Form submit'ten hemen önce editor içeriğini gizli input'a kopyalar.
// CmsPageForm onSubmit'inde çağrılır.
export function syncRichTextEditor(name: string): void {
  const hidden = document.getElementById(`rich-${name}`) as HTMLInputElement | null;
  const container = hidden?.closest("div")?.querySelector("[contenteditable]") as HTMLElement | null;
  if (hidden && container) {
    hidden.value = container.innerHTML;
  }
}
