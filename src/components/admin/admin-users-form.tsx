"use client";

import { useActionState } from "react";

import {
  createAdminUserAction,
  type UserActionState,
} from "@/app/admin/(panel)/users/actions";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring";

export function AdminUsersForm({
  action,
}: {
  action: typeof createAdminUserAction;
}) {
  const [state, formAction, isPending] = useActionState<UserActionState, FormData>(
    action,
    {},
  );

  return (
    <div>
      {state?.saved && (
        <p role="status" className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          Kullanıcı oluşturuldu.
        </p>
      )}
      {state?.error && (
        <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Ad Soyad *" error={state?.fieldErrors?.name}>
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="E-posta *" error={state?.fieldErrors?.email}>
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field
          label="Şifre *"
          error={state?.fieldErrors?.password}
          hint="En az 12 karakter, 3 sınıf"
        >
          <input name="password" type="password" required className={inputClass} />
        </Field>
        <Field label="Rol *" error={state?.fieldErrors?.role}>
          <select name="role" defaultValue="EDITOR" className={inputClass}>
            <option value="ADMIN">ADMIN</option>
            <option value="EDITOR">EDITOR</option>
          </select>
        </Field>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
          >
            {isPending ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-xs text-muted-foreground/70">{hint}</span>
      )}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
