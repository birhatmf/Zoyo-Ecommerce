"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";

import {
  saveStorefrontTextAction,
  type SettingsActionState,
} from "@/app/admin/(panel)/settings/actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

export function StorefrontTextForm({
  fieldKey,
  label,
  defaultValue,
  multiline,
}: {
  fieldKey: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
}) {
  const [state, formAction, isPending] = useActionState<SettingsActionState, FormData>(
    saveStorefrontTextAction,
    {},
  );

  return (
    <form action={formAction} className="rounded-md border border-border/60 bg-muted/20 p-3">
      <input type="hidden" name="key" value={fieldKey} />
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {state?.saved && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <Check className="size-3.5" /> Kaydedildi
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          name="value"
          rows={3}
          defaultValue={defaultValue}
          className={`${inputClass} mt-1.5 resize-y`}
        />
      ) : (
        <input
          name="value"
          defaultValue={defaultValue}
          className={`${inputClass} mt-1.5`}
        />
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="h-8 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          {isPending ? "..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
