"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { clearCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import {
  effectivePrice,
  useCartProducts,
} from "@/lib/use-cart-products";

type FormState = {
  customerFirstName: string;
  customerLastName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  postalCode: string;
  address: string;
  invoiceType: "INDIVIDUAL" | "CORPORATE";
  tcNumber: string;
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  invoiceAddress: string;
  note: string;
  acceptDistanceSales: boolean;
  acceptKvkk: boolean;
  acceptPrivacy: boolean;
};

const initialState: FormState = {
  customerFirstName: "",
  customerLastName: "",
  phone: "",
  email: "",
  city: "",
  district: "",
  postalCode: "",
  address: "",
  invoiceType: "INDIVIDUAL",
  tcNumber: "",
  companyName: "",
  taxOffice: "",
  taxNumber: "",
  invoiceAddress: "",
  note: "",
  acceptDistanceSales: false,
  acceptKvkk: false,
  acceptPrivacy: false,
};

const legalLinks = [
  { name: "acceptDistanceSales" as const, label: "Mesafeli satış sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
  { name: "acceptKvkk" as const, label: "KVKK aydınlatma metni", href: "/kvkk" },
  { name: "acceptPrivacy" as const, label: "Gizlilik politikası", href: "/gizlilik-politikasi" },
];

export function CheckoutForm({
  orderNotes = [],
}: {
  orderNotes?: string[];
}) {
  const { cart, products, isLoading } = useCartProducts();
  const [form, setForm] = useState<FormState>(initialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const productMap = new Map(products.map((product) => [product.id, product]));
  const activeItems = isLoading ? [] : cart.filter((item) => productMap.has(item.productId));
  const total = activeItems.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return product ? sum + effectivePrice(product) * item.quantity : sum;
  }, 0);

  if (!isLoading && cart.length > 0 && activeItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-heading text-2xl font-medium">
          Sepetinizdeki ürünler artık mevcut değil
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Lütfen sepetinizi güncelleyip tekrar deneyin.
        </p>
        <Link
          href="/sepet"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Sepete Dön
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-heading text-2xl font-medium">Sepetiniz boş</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sipariş oluşturmak için önce sepetinize ürün ekleyin.
        </p>
        <Link
          href="/urunler"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Ürünleri Keşfet
        </Link>
      </div>
    );
  }

  function update<K extends keyof FormState>(name: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsPending(true);
    try {
      // Fatura adresi boşsa teslimat adresi kullanılır (form'daki vaat).
      const invoiceAddress = form.invoiceAddress.trim() || form.address.trim();
      // form içindeki invoiceAddress'i override edeceğimiz için ayırıyoruz
      const payload = { ...form, invoiceAddress };
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          items: activeItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        setFormError(data.error ?? "Sipariş oluşturulamadı. Lütfen tekrar deneyin.");
        return;
      }
      clearCart();
      router.push(`/siparis/basarili?order=${encodeURIComponent(data.orderNumber)}`);
    } catch {
      setFormError("Sipariş oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsPending(false);
    }
  }

  const inputClass = (name: keyof FormState) =>
    fieldErrors[name] ? "border-destructive" : undefined;

  return (
    <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-[1fr_340px]">
      <div className="space-y-10">
        <fieldset>
          <legend className="font-heading text-lg font-medium">İletişim Bilgileri</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Ad *" error={fieldErrors.customerFirstName}>
              <input
                required
                autoComplete="given-name"
                className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("customerFirstName") ?? ""}`}
                value={form.customerFirstName}
                onChange={(event) => update("customerFirstName", event.target.value)}
              />
            </Field>
            <Field label="Soyad *" error={fieldErrors.customerLastName}>
              <input
                required
                autoComplete="family-name"
                className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("customerLastName") ?? ""}`}
                value={form.customerLastName}
                onChange={(event) => update("customerLastName", event.target.value)}
              />
            </Field>
            <Field label="Telefon *" error={fieldErrors.phone}>
              <input
                required
                type="tel"
                inputMode="tel"
                placeholder="05xx xxx xx xx"
                autoComplete="tel"
                className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("phone") ?? ""}`}
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>
            <Field label="E-posta (opsiyonel)" error={fieldErrors.email}>
              <input
                type="email"
                autoComplete="email"
                className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("email") ?? ""}`}
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-heading text-lg font-medium">Teslimat Adresi</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="İl *" error={fieldErrors.city}>
              <input
                required
                autoComplete="address-level1"
                className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("city") ?? ""}`}
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
              />
            </Field>
            <Field label="İlçe *" error={fieldErrors.district}>
              <input
                required
                autoComplete="address-level2"
                className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("district") ?? ""}`}
                value={form.district}
                onChange={(event) => update("district", event.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Adres *" error={fieldErrors.address}>
              <textarea
                required
                rows={3}
                autoComplete="street-address"
                className={`w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("address") ?? ""}`}
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4 sm:max-w-[240px]">
            <Field label="Posta Kodu (opsiyonel)" error={fieldErrors.postalCode}>
              <input
                inputMode="numeric"
                maxLength={5}
                autoComplete="postal-code"
                placeholder="34000"
                className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("postalCode") ?? ""}`}
                value={form.postalCode}
                onChange={(event) =>
                  update("postalCode", event.target.value.replace(/\D/g, ""))
                }
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Sipariş Notu (opsiyonel)" error={fieldErrors.note}>
              <textarea
                rows={2}
                className="w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring"
                value={form.note}
                onChange={(event) => update("note", event.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-heading text-lg font-medium">Fatura Bilgileri</legend>

          <div className="mt-4 inline-flex rounded-md border border-border p-1" role="group" aria-label="Fatura türü">
            {(
              [
                { value: "INDIVIDUAL", label: "Bireysel" },
                { value: "CORPORATE", label: "Kurumsal" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={form.invoiceType === option.value}
                onClick={() => update("invoiceType", option.value)}
                className={`rounded px-4 py-1.5 text-sm transition-colors ${
                  form.invoiceType === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {form.invoiceType === "INDIVIDUAL" ? (
              <Field label="T.C. Kimlik No (opsiyonel)" error={fieldErrors.tcNumber}>
                <input
                  inputMode="numeric"
                  maxLength={11}
                  autoComplete="off"
                  className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("tcNumber") ?? ""}`}
                  value={form.tcNumber}
                  onChange={(event) =>
                    update("tcNumber", event.target.value.replace(/\D/g, ""))
                  }
                />
              </Field>
            ) : (
              <>
                <Field label="Şirket Ünvanı *" error={fieldErrors.companyName}>
                  <input
                    required
                    className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("companyName") ?? ""}`}
                    value={form.companyName}
                    onChange={(event) => update("companyName", event.target.value)}
                  />
                </Field>
                <Field label="Vergi Dairesi *" error={fieldErrors.taxOffice}>
                  <input
                    required
                    className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("taxOffice") ?? ""}`}
                    value={form.taxOffice}
                    onChange={(event) => update("taxOffice", event.target.value)}
                  />
                </Field>
                <Field label="Vergi Numarası *" error={fieldErrors.taxNumber}>
                  <input
                    required
                    inputMode="numeric"
                    maxLength={11}
                    className={`w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("taxNumber") ?? ""}`}
                    value={form.taxNumber}
                    onChange={(event) =>
                      update("taxNumber", event.target.value.replace(/\D/g, ""))
                    }
                  />
                </Field>
              </>
            )}
          </div>
          <div className="mt-4">
            <Field
              label="Fatura Adresi (opsiyonel — boş bırakılırsa teslimat adresi kullanılır)"
              error={fieldErrors.invoiceAddress}
            >
              <textarea
                rows={2}
                className={`w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ring ${inputClass("invoiceAddress") ?? ""}`}
                value={form.invoiceAddress}
                onChange={(event) => update("invoiceAddress", event.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-heading text-lg font-medium">Yasal Onaylar</legend>
          <div className="mt-4 space-y-3">
            {legalLinks.map((legal) => (
              <label key={legal.name} className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  required
                  checked={form[legal.name]}
                  onChange={(event) => update(legal.name, event.target.checked)}
                  className="mt-0.5 size-4 accent-accent"
                />
                <span className="text-muted-foreground">
                  <Link
                    href={legal.href}
                    target="_blank"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {legal.label}
                  </Link>{" "}
                  okudum ve kabul ediyorum.
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {orderNotes.length > 0 && (
          <fieldset>
            <legend className="font-heading text-lg font-medium">Sipariş Maddeleri</legend>
            <p className="mt-2 text-sm text-muted-foreground">
              Sipariş sürecinize dair bilmeniz gereken maddeler:
            </p>
            <ul className="mt-3 space-y-2 rounded-md border border-border bg-card p-4">
              {orderNotes.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm">
                  <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        {formError && (
          <div role="alert" className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
      </div>

      <aside>
        <div className="lg:sticky lg:top-24">
          <h2 className="font-heading text-lg font-medium">Sipariş Özeti</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {activeItems.map((item) => {
              const product = productMap.get(item.productId)!;
              return (
                <li key={item.productId} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <span>
                    {product.name}
                    <span className="block text-xs text-muted-foreground">{item.quantity} adet</span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(effectivePrice(product) * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium">Toplam</span>
            <span className="font-heading text-xl">{formatPrice(total)}</span>
          </div>
          <button
            type="submit"
            disabled={isPending || isLoading || total === 0}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? "Gönderiliyor..." : "Sipariş Talebi Oluştur"}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Online ödeme alınmamaktadır. Sipariş talebiniz firma tarafından onaylandıktan sonra
            sizinle iletişime geçilir.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
