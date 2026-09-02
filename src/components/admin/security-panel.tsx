"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import {
  changePasswordAction,
  confirmTotpEnrollmentAction,
  disableTotpAction,
  startTotpEnrollmentAction,
  type SecurityActionState,
} from "@/app/admin/(panel)/settings/security/actions";

const initial: SecurityActionState = {};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function SecurityPanel({
  initialTotpEnabled,
}: {
  initialTotpEnabled: boolean;
}) {
  const [passwordState, passwordAction] = useActionState<
    SecurityActionState,
    FormData
  >(changePasswordAction, initial);
  const [totpState, totpAction] = useActionState<SecurityActionState, FormData>(
    confirmTotpEnrollmentAction,
    initial,
  );

  const [enrollment, setEnrollment] = useState<{
    secret: string;
    otpAuthUrl: string;
  } | null>(null);
  const [enrollPending, startEnrollTransition] = useTransition();
  const [totpEnabled] = useState(initialTotpEnabled);

  async function startEnrollment() {
    const result = await startTotpEnrollmentAction();
    if (result.totpSecret && result.otpAuthUrl) {
      setEnrollment({ secret: result.totpSecret, otpAuthUrl: result.otpAuthUrl });
    }
  }

  return (
    <div className="mt-6 space-y-8">
      {/* Şifre değiştirme */}
      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Şifre Değiştir</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Minimum 12 karakter; küçük/büyük harf, rakam ve simge sınıflarından en az 3&apos;ü kullanılmalıdır.
        </p>
        <form action={passwordAction} className="mt-4 space-y-3">
          <Field name="currentPassword" label="Mevcut Şifre" type="password" />
          <Field name="newPassword" label="Yeni Şifre" type="password" />
          <Field name="confirmPassword" label="Yeni Şifre (Tekrar)" type="password" />
          {passwordState.error && (
            <p role="alert" className="text-xs text-destructive">
              {passwordState.error}
            </p>
          )}
          {passwordState.success && (
            <p role="status" className="text-xs text-emerald-600">
              {passwordState.success}
            </p>
          )}
          <SubmitButton label="Şifreyi Güncelle" pendingLabel="Güncelleniyor..." />
        </form>
      </section>

      {/* 2FA */}
      <section className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">İki Faktörlü Kimlik Doğrulama (TOTP)</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Google Authenticator, 1Password veya Authy gibi bir uygulama ile çalışır.
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs ${
              totpEnabled
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {totpEnabled ? "Etkin" : "Devre dışı"}
          </span>
        </div>

        {!totpEnabled && !enrollment && (
          <button
            type="button"
            onClick={() => startEnrollTransition(startEnrollment)}
            disabled={enrollPending}
            className="mt-4 inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {enrollPending ? "Hazırlanıyor..." : "2FA Kurulumunu Başlat"}
          </button>
        )}

        {enrollment && !totpEnabled && (
          <div className="mt-4 space-y-3">
            <p className="text-sm">
              1. Authenticator uygulamanıza aşağıdaki secret&apos;ı ekleyin veya karekodu tarayın:
            </p>
            <code className="block break-all rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
              {enrollment.secret}
            </code>
            <p className="break-all text-xs text-muted-foreground">
              otpauth URL: <span className="font-mono">{enrollment.otpAuthUrl}</span>
            </p>
            <form action={totpAction} className="space-y-3">
              <Field name="code" label="2. Uygulamadaki 6 Haneli Kod" />
              {totpState.error && (
                <p role="alert" className="text-xs text-destructive">
                  {totpState.error}
                </p>
              )}
              {totpState.success && (
                <p role="status" className="text-xs text-emerald-600">
                  {totpState.success}
                </p>
              )}
              <SubmitButton label="Etkinleştir" pendingLabel="Doğrulanıyor..." />
            </form>
          </div>
        )}

        {totpEnabled && (
          <form action={disableTotpAction} className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Devre dışı bırakmak için mevcut şifreniz ve güncel 2FA kodunuz gerekir.
            </p>
            <Field name="password" label="Mevcut Şifre" type="password" />
            <Field name="code" label="2FA Kodu" />
            <SubmitButton label="2FA'yı Devre Dışı Bırak" pendingLabel="..." />
          </form>
        )}
      </section>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
      />
    </label>
  );
}
