"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/admin/login/actions";

export function LoginForm({ showTotp = false }: { showTotp?: boolean }) {
  const [state, formAction, isPending] = useActionState<
    { error?: string } | undefined,
    FormData
  >(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted-foreground">E-posta</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted-foreground">Şifre</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-muted-foreground">
          2FA kodu {showTotp ? "" : "(hesabınız için etkinse doldurun)"}
        </span>
        <input
          name="totp"
          inputMode="numeric"
          maxLength={6}
          pattern="\d{6}"
          autoComplete="one-time-code"
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring"
        />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
      >
        {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
