"use client";

import { useActionState, useState } from "react";

import {
  resetAdminUserPasswordAction,
  type UserActionState,
} from "@/app/admin/(panel)/users/actions";

const inputClass =
  "h-7 w-32 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring";

export function AdminResetPasswordButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<UserActionState, FormData>(
    resetAdminUserPasswordAction,
    {},
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs underline-offset-4 hover:underline"
      >
        Şifre Sıfırla
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <form action={formAction} className="flex flex-wrap items-center justify-end gap-2">
        <input type="hidden" name="id" value={userId} />
        <input
          name="password"
          type="password"
          required
          placeholder="Yeni şifre"
          className={inputClass}
        />
        <input
          name="confirmPassword"
          type="password"
          required
          placeholder="Tekrar"
          className={`${inputClass} w-24`}
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-7 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Vazgeç
        </button>
      </form>
      {state?.error && (
        <p role="alert" className="max-w-56 text-right text-xs text-destructive">
          {state.error}
        </p>
      )}
      {state?.saved && (
        <p role="status" className="text-xs text-emerald-600">
          Şifre güncellendi
        </p>
      )}
    </div>
  );
}