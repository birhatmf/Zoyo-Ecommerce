"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  saveBankAccountAction,
  type SettingsActionState,
} from "@/app/admin/(panel)/settings/actions";

export type BankAccountDefaults = {
  id?: string;
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

export function BankAccountForm({ defaults = {} }: { defaults?: BankAccountDefaults }) {
  const [state, formAction, isPending] = useActionState<SettingsActionState, FormData>(
    saveBankAccountAction,
    {},
  );

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
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

      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Banka Adı *</span>
          <input name="bankName" required defaultValue={defaults.bankName} className={inputClass} />
          {fieldError("bankName") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("bankName")}</span>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Hesap Sahibi *</span>
          <input name="accountHolder" required defaultValue={defaults.accountHolder} className={inputClass} />
          {fieldError("accountHolder") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("accountHolder")}</span>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">IBAN *</span>
          <input
            name="iban"
            required
            defaultValue={defaults.iban}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            className={inputClass}
          />
          {fieldError("iban") && (
            <span className="mt-1 block text-xs text-destructive">{fieldError("iban")}</span>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Açıklama</span>
          <input name="description" defaultValue={defaults.description} className={inputClass} />
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted-foreground">Sıralama</span>
          <input
            name="sortOrder"
            type="number"
            min="0"
            max="999"
            defaultValue={defaults.sortOrder ?? 0}
            className={`${inputClass} w-24`}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" name="active" defaultChecked={defaults.active ?? true} className="size-4 accent-accent" />
          Aktif (sipariş sonrası ekranda gösterilir)
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <Link
          href="/admin/settings/bank"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
