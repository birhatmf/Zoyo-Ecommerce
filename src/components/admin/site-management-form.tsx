"use client";

import { useActionState } from "react";

import {
  saveSiteManagementAction,
  type SettingsActionState,
} from "@/app/admin/(panel)/settings/actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

export function SiteManagementForm({
  defaults,
}: {
  defaults: Record<string, string>;
}) {
  const [state, formAction, isPending] = useActionState<SettingsActionState, FormData>(
    saveSiteManagementAction,
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

      <form action={formAction} className="space-y-6">
        <div className="rounded-md border border-border bg-card p-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="maintenanceMode"
              defaultChecked={defaults.maintenanceMode === "true"}
              className="mt-0.5 size-4"
            />
            <span>
              <span className="block text-sm font-medium">Bakım Modu</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Açıkken ziyaretçiler bakım sayfasını görür. Yöneticiler siteyi görmeye devam eder.
              </span>
            </span>
          </label>

          <div className="mt-5">
            <span className="mb-1.5 block text-sm text-muted-foreground">Bakım Mesajı</span>
            <textarea
              name="maintenanceMessage"
              rows={3}
              defaultValue={defaults.maintenanceMessage ?? ""}
              placeholder="Sitemiz kısa süreliğine bakımda. Kısa süre içinde tekrar hizmetinizdeyiz."
              className={`${inputClass} resize-y`}
            />
            <span className="mt-1 block text-xs text-muted-foreground/80">
              Boş bırakılırsa varsayılan mesaj gösterilir.
            </span>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <span className="mb-1.5 block text-sm text-muted-foreground">
            Footer Logo Yüksekliği (px)
          </span>
          <input
            type="number"
            name="footerLogoHeight"
            min={16}
            max={160}
            step={1}
            defaultValue={defaults.footerLogoHeight || "40"}
            className={`${inputClass} max-w-40`}
          />
          <span className="mt-1 block text-xs text-muted-foreground/80">
            16–160 px arası. Footer logosunun yüksekliği.
          </span>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
