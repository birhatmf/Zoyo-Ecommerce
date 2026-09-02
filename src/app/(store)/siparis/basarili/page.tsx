import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";

import { CopyIbanButton } from "@/components/storefront/copy-iban-button";
import { formatPrice, telUrl, whatsappUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Sipariş Talebiniz Alındı",
  robots: { index: false },
};

type SuccessPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const [order, bankAccounts, settings] = await Promise.all([
    prisma.order.findFirst({
      where: { orderNumber },
      select: { orderNumber: true, total: true, status: true },
    }),
    prisma.bankAccount.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSiteSettings(),
  ]);

  if (!order) notFound();

  const waLink = settings.whatsapp
    ? whatsappUrl(
        settings.whatsapp,
        `Merhaba,\n\n${order.orderNumber} numaralı siparişim hakkında iletişime geçmek istiyorum.\n\nSipariş toplamı: ${formatPrice(order.total)}`,
      )
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 md:py-20">
      <div className="text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
          Sipariş Talebiniz Alındı
        </p>
        <h1 className="mt-4 font-heading text-3xl font-medium sm:text-4xl">
          Teşekkürler!
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Sipariş talebiniz alınmıştır. Siparişiniz firmamız tarafından kontrol edildikten
          sonra sizinle iletişime geçilecektir.
        </p>

        <div className="mx-auto mt-8 inline-flex flex-col items-center gap-1 rounded-md border border-border bg-secondary/60 px-8 py-5">
          <span className="text-xs text-muted-foreground">Sipariş Numaranız</span>
          <span className="font-heading text-2xl font-medium tracking-wide">
            {order.orderNumber}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            Toplam: <strong className="text-foreground">{formatPrice(order.total)}</strong>
          </span>
        </div>
      </div>

      {bankAccounts.length > 0 && (
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="font-heading text-lg font-medium">Banka Bilgileri</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Online ödeme alınmamaktadır. Ödeme yapmak isterseniz aşağıdaki hesaplara
            transfer gerçekleştirebilirsiniz.
          </p>
          <ul className="mt-6 space-y-4">
            {bankAccounts.map((account) => (
              <li key={account.id} className="rounded-md border border-border p-4">
                <p className="text-sm font-medium">{account.bankName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {account.accountHolder}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <code className="text-sm tracking-wide">{account.iban}</code>
                  <CopyIbanButton iban={account.iban} />
                </div>
                {account.description && (
                  <p className="mt-2 text-xs text-muted-foreground">{account.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12 border-t border-border pt-10">
        <h2 className="font-heading text-lg font-medium">İletişime Geçin</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Siparişiniz hakkında soru sormak veya bilgi almak için bize ulaşabilirsiniz.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="size-4" />
              WhatsApp ile Gönder
            </a>
          )}
          {settings.phone && (
            <a
              href={telUrl(settings.phone)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Phone className="size-4" />
              Telefonla Ara
            </a>
          )}
        </div>
      </section>

      <p className="mt-12 text-center">
        <Link
          href="/urunler"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Alışverişe devam et
        </Link>
      </p>
    </div>
  );
}
