"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

// Paylaşılan contentEditable metin bileşeni.
// Blur'da action'a FormData gönderilir; Enter (tek satır) kaydeder, Esc iptal.
// Action imzası: (formData) => Promise<unknown>.
export function InlineEditable({
  action,
  value,
  fieldName,
  valueField = "value",
  hiddenFields = {},
  className = "",
  multiline = false,
}: {
  action: (formData: FormData) => Promise<unknown>;
  value: string;
  fieldName: string;
  valueField?: string;
  hiddenFields?: Record<string, string>;
  className?: string;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  async function handleBlur() {
    const newValue = ref.current?.innerText ?? "";
    if (newValue === value) return;

    setSaving(true);
    setSaved(false);
    const fd = new FormData();
    fd.set(fieldName, hiddenFields[fieldName] ?? value);
    fd.set(valueField, newValue);
    for (const [k, v] of Object.entries(hiddenFields)) {
      if (k !== fieldName) fd.set(k, v);
    }

    try {
      await action(fd);
      setSaved(true);
      const timer = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timer);
    } catch {
      if (ref.current) ref.current.innerText = value;
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="relative inline-flex items-center gap-1">
      <span
        ref={ref}
        contentEditable={!saving}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={multiline}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
          }
          if (e.key === "Escape") {
            ref.current!.innerText = value;
            (e.currentTarget as HTMLElement).blur();
          }
        }}
        className={`cursor-text rounded-sm outline-none transition-shadow focus:bg-white/10 focus:ring-2 focus:ring-accent/60 ${className} ${saving ? "opacity-50" : ""}`}
      />
      {saved && (
        <Check className="size-3.5 shrink-0 text-emerald-500" aria-label="kaydedildi" />
      )}
    </span>
  );
}
