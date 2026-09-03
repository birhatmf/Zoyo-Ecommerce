"use client";

import { useActionState, useState } from "react";

import {
  saveSettingsAction,
  type SettingsActionState,
} from "@/app/admin/(panel)/settings/actions";
import { MediaPicker } from "@/components/admin/media-picker";
import { MediaUploadButton } from "@/components/admin/media-upload-button";

export type SettingsField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "media";
  hint?: string;
  placeholder?: string;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

export function SettingsForm({
  fields,
  defaults,
  uploadAction,
}: {
  fields: SettingsField[];
  defaults: Record<string, string>;
  // Görsel yükleme: anında kaydeden server action (PRD §45)
  uploadAction?: (formData: FormData) => Promise<void>;
}) {
  const [state, formAction, isPending] = useActionState<SettingsActionState, FormData>(
    saveSettingsAction,
    {},
  );

  return (
    <div>
      {state?.saved && (
        <p role="status" className="mb-5 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          Değişiklikler kaydedildi.
        </p>
      )}
      {state?.error && (
        <p role="alert" className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <form action={formAction} className="contents">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) =>
            field.type === "media" ? null : (
              <div
                key={field.name}
                className={field.type === "textarea" ? "sm:col-span-2" : undefined}
              >
                <span className="mb-1.5 block text-sm text-muted-foreground">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    rows={3}
                    defaultValue={defaults[field.name] ?? ""}
                    placeholder={field.placeholder}
                    className={`${inputClass} resize-y`}
                  />
                ) : (
                  <input
                    name={field.name}
                    defaultValue={defaults[field.name] ?? ""}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                )}
                {field.hint && (
                  <span className="mt-1 block text-xs text-muted-foreground/80">{field.hint}</span>
                )}
              </div>
            ),
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 h-10 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>

      {/* Görsel alanları: mevcut değer + anında kaydeden yükleme + kütüphane seçimi */}
      {fields
        .filter((field) => field.type === "media")
        .map((field) => (
          <MediaField
            key={field.name}
            field={field}
            currentValue={defaults[field.name] ?? ""}
            uploadAction={uploadAction}
          />
        ))}
    </div>
  );
}

function MediaField({
  field,
  currentValue,
  uploadAction,
}: {
  field: SettingsField;
  currentValue: string;
  uploadAction?: (formData: FormData) => Promise<void>;
}) {
  const [value, setValue] = useState(currentValue);

  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-sm text-muted-foreground">{field.label}</span>
      <div className="flex items-center gap-2">
        <div className="h-9 min-w-0 flex-1 truncate rounded-md border border-input bg-muted/50 px-3 text-sm leading-9 text-muted-foreground">
          {value || "Henüz görsel yüklenmemiş"}
        </div>
        {uploadAction && (
          <MediaUploadButton
            action={uploadAction}
            hiddenFields={{ key: field.name }}
          />
        )}
        <MediaPicker
          onSelect={async (url) => {
            // Seçilen URL'i anında kaydet (saveSettingInlineAction mantığı).
            const { saveSettingInlineAction } = await import(
              "@/app/admin/(panel)/settings/actions"
            );
            const fd = new FormData();
            fd.set("key", field.name);
            fd.set("value", url);
            await saveSettingInlineAction(fd);
            setValue(url);
          }}
        />
      </div>
      {field.hint && (
        <span className="mt-1 block text-xs text-muted-foreground/80">{field.hint}</span>
      )}
    </div>
  );
}
