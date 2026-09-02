import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";

import {
  updateOrderAction,
  updateOrderContactAction,
} from "@/app/admin/(panel)/orders/actions";
import {
  formatDate,
  getOrderNoteTemplates,
  ORDER_STATUSES,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
} from "@/lib/order";
import { formatPrice, whatsappUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { OrderNotes } from "@/components/admin/order-notes";
import { PrintButton } from "@/components/admin/print-button";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Sipariş Detayı",
};

const INVOICE_TYPE_LABELS = {
  INDIVIDUAL: "Bireysel",
  CORPORATE: "Kurumsal",
} as const;

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            include: {
              images: {
                orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
      notes: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!order) notFound();

  const noteTemplates = await getOrderNoteTemplates();

  const waLink = whatsappUrl(
    order.phoneNormalized,
    `Merhaba,\n\n${order.orderNumber} numaralı siparişiniz hakkında iletişime geçmek istiyoruz.`,
  );

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline print:hidden"
          >
            ← Siparişler
          </Link>
          <h1 className="mt-1 font-heading text-xl font-medium">
            Sipariş {order.orderNumber}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block rounded-full border px-3 py-1 text-xs ${ORDER_STATUS_BADGE_CLASSES[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <PrintButton />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {/* A. Müşteri & Fatura Bilgileri */}
          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="text-sm font-medium">Müşteri &amp; Fatura Bilgileri</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <div>
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Müşteri
                </h3>
                <dl className="mt-2.5 space-y-2 text-sm">
                  <div>
                    <dt className="sr-only">Ad Soyad</dt>
                    <dd className="font-medium">
                      {order.customerFirstName} {order.customerLastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Telefon</dt>
                    <dd>
                      <a href={`tel:${order.phoneNormalized}`} className="underline-offset-4 hover:underline">
                        {order.phoneNormalized}
                      </a>
                      {" — "}
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline print:hidden"
                      >
                        <MessageCircle className="size-3.5" />
                        WhatsApp
                      </a>
                    </dd>
                  </div>
                  {order.email && (
                    <div>
                      <dt className="text-xs text-muted-foreground">E-posta</dt>
                      <dd className="break-all">{order.email}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Teslimat Adresi
                </h3>
                <address className="mt-2.5 text-sm leading-relaxed not-italic">
                  {order.address}
                  <br />
                  {order.district} / {order.city}
                  {order.postalCode && (
                    <>
                      <br />
                      {order.postalCode}
                    </>
                  )}
                </address>
              </div>

              <div>
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Fatura ({INVOICE_TYPE_LABELS[order.invoiceType]})
                </h3>
                <dl className="mt-2.5 space-y-2 text-sm">
                  {order.invoiceType === "INDIVIDUAL" ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">T.C. Kimlik No</dt>
                      <dd>{order.tcNumber ?? "—"}</dd>
                    </div>
                  ) : (
                    <>
                      <div>
                        <dt className="text-xs text-muted-foreground">Şirket Ünvanı</dt>
                        <dd className="font-medium">{order.companyName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Vergi Dairesi / No</dt>
                        <dd>
                          {order.taxOffice} / {order.taxNumber}
                        </dd>
                      </div>
                    </>
                  )}
                  {order.invoiceAddress && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Fatura Adresi</dt>
                      <dd className="leading-relaxed">{order.invoiceAddress}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {(order.customerNote || order.adminNote) && (
              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                {order.customerNote && (
                  <p>
                    <span className="text-muted-foreground">Müşteri notu: </span>
                    {order.customerNote}
                  </p>
                )}
                {order.adminNote && (
                  <p>
                    <span className="text-muted-foreground">Yönetici notu: </span>
                    {order.adminNote}
                  </p>
                )}
              </div>
            )}

            {/* İletişim bilgilerini düzenle */}
            <details className="mt-5 border-t border-border pt-4 print:hidden">
              <summary className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">
                İletişim Bilgilerini Düzenle
              </summary>
              <form action={updateOrderContactAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="orderId" value={order.id} />
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Ad *</span>
                  <input
                    name="customerFirstName"
                    required
                    defaultValue={order.customerFirstName}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Soyad *</span>
                  <input
                    name="customerLastName"
                    required
                    defaultValue={order.customerLastName}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Telefon *</span>
                  <input
                    name="phone"
                    required
                    type="tel"
                    inputMode="tel"
                    placeholder="05xx xxx xx xx"
                    defaultValue={order.phoneNormalized}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">E-posta</span>
                  <input
                    name="email"
                    type="email"
                    defaultValue={order.email ?? ""}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">İl *</span>
                  <input
                    name="city"
                    required
                    defaultValue={order.city}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">İlçe *</span>
                  <input
                    name="district"
                    required
                    defaultValue={order.district}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs text-muted-foreground">Adres *</span>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    defaultValue={order.address}
                    className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-2 text-sm outline-none focus:border-ring"
                  />
                </label>
                <label className="block sm:max-w-[160px]">
                  <span className="mb-1 block text-xs text-muted-foreground">Posta Kodu</span>
                  <input
                    name="postalCode"
                    inputMode="numeric"
                    maxLength={5}
                    defaultValue={order.postalCode ?? ""}
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
                  />
                </label>
                <div className="flex items-end justify-end sm:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
                  >
                    Bilgileri Güncelle
                  </button>
                </div>
              </form>
            </details>
          </section>

          {/* B. Ürün Listesi (tablo görünümü) */}
          <section className="overflow-hidden rounded-md border border-border bg-card">
            <h2 className="border-b border-border px-5 py-3 text-sm font-medium">
              Sipariş Ürünleri
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left text-xs text-muted-foreground uppercase">
                    <th className="px-5 py-2.5 text-center font-medium w-[64px]">Görsel</th>
                    <th className="px-3 py-2.5 font-medium">Ürün</th>
                    <th className="px-3 py-2.5 font-medium">Kod</th>
                    <th className="px-3 py-2.5 text-right font-medium">Birim Fiyat</th>
                    <th className="px-3 py-2.5 text-right font-medium">Adet</th>
                    <th className="px-5 py-2.5 text-right font-medium">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const image = item.product?.images[0];
                    return (
                      <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                        <td className="px-5 py-2.5">
                          <div className="relative mx-auto size-12 overflow-hidden rounded border border-border bg-muted">
                            {image ? (
                              <Image
                                src={image.url}
                                alt={image.altText ?? item.productName}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground/50">
                                {item.productName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="max-w-[280px] px-3 py-2.5">
                          <span className="line-clamp-2">{item.productName}</span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                          {item.productCode}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {formatPrice(item.unitPrice)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{item.quantity}</td>
                        <td className="px-5 py-2.5 text-right font-medium whitespace-nowrap tabular-nums">
                          {formatPrice(item.totalPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-b border-border bg-secondary/50">
                    <td colSpan={5} className="px-5 py-2 text-right text-sm">
                      Ara Toplam
                    </td>
                    <td className="px-5 py-2 text-right whitespace-nowrap tabular-nums">
                      {formatPrice(subtotal)}
                    </td>
                  </tr>
                  <tr className="bg-secondary/50">
                    <td colSpan={5} className="px-5 py-3 text-right text-sm font-medium">
                      Genel Toplam
                    </td>
                    <td className="px-5 py-3 text-right font-heading text-lg font-medium whitespace-nowrap">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* C. Yönetici Maddeleri & Notlar */}
          <OrderNotes orderId={order.id} notes={order.notes} templates={noteTemplates} />
        </div>

        <aside className="print:hidden">
          <form action={updateOrderAction} className="rounded-md border border-border bg-card p-5 lg:sticky lg:top-24">
            <input type="hidden" name="orderId" value={order.id} />
            <h2 className="text-sm font-medium">Sipariş Yönetimi</h2>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs text-muted-foreground">Durum</span>
              <select
                name="status"
                defaultValue={order.status}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs text-muted-foreground">Admin Notu</span>
              <textarea
                name="adminNote"
                rows={4}
                defaultValue={order.adminNote ?? ""}
                placeholder="Dahili not…"
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              />
            </label>
            <button
              type="submit"
              className="mt-4 h-9 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Kaydet
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
