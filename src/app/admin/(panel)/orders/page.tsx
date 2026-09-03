import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { InvoiceType, OrderStatus } from "@/generated/prisma/client";
import { ArrowUpRight, MessageCircle, X } from "lucide-react";
import { whatsappUrl } from "@/lib/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/lib/order-status";
import { OrderStatusInlineSelect } from "@/components/admin/order-status-inline-select";

export const metadata: Metadata = {
  title: "Siparişler",
};

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "newest", label: "En yeni" },
  { value: "oldest", label: "En eski" },
  { value: "total_desc", label: "Tutar (yüksek)" },
  { value: "total_asc", label: "Tutar (düşük)" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const INVOICE_TYPES = [
  { value: "INDIVIDUAL", label: "Bireysel" },
  { value: "CORPORATE", label: "Kurumsal" },
] as const;

type OrdersPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    type?: string;
    from?: string;
    to?: string;
    min?: string;
    max?: string;
    sort?: string;
    page?: string;
  }>;
};

type Filters = {
  status?: OrderStatus;
  q: string;
  type?: InvoiceType;
  from?: string;
  to?: string;
  min?: string;
  max?: string;
  sort: SortValue;
};

function parseFilters(
  params: Awaited<OrdersPageProps["searchParams"]>,
): Filters {
  const status = ORDER_STATUSES.find((s) => s === params.status);
  const type =
    params.type === "INDIVIDUAL" || params.type === "CORPORATE"
      ? params.type
      : undefined;
  const sort = SORT_OPTIONS.find((s) => s.value === params.sort)?.value ?? "newest";
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;

  return {
    status,
    q: (params.q ?? "").trim(),
    type,
    from: params.from && dateRe.test(params.from) ? params.from : undefined,
    to: params.to && dateRe.test(params.to) ? params.to : undefined,
    min:
      params.min !== undefined &&
      params.min !== "" &&
      !Number.isNaN(Number(params.min))
        ? params.min
        : undefined,
    max:
      params.max !== undefined &&
      params.max !== "" &&
      !Number.isNaN(Number(params.max))
        ? params.max
        : undefined,
    sort,
  };
}

function buildWhere(filters: Filters): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.type) where.invoiceType = filters.type;

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(`${filters.from}T00:00:00`);
    if (filters.to) where.createdAt.lte = new Date(`${filters.to}T23:59:59.999`);
  }

  if (filters.min !== undefined || filters.max !== undefined) {
    where.total = {};
    if (filters.min !== undefined) where.total.gte = Number(filters.min);
    if (filters.max !== undefined) where.total.lte = Number(filters.max);
  }

  const q = filters.q;
  if (q) {
    // Telefon numarası farklı biçimlerde girilebilir; yalnızca rakamlara indirip
    // normalize edilmiş alanda ara (örn. "+90 532…" ↔ "0532")
    const digits = q.replace(/\D/g, "");
    const or: Prisma.OrderWhereInput[] = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customerFirstName: { contains: q, mode: "insensitive" } },
      { customerLastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { city: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { taxOffice: { contains: q, mode: "insensitive" } },
      { taxNumber: { contains: digits || q } },
      { tcNumber: { contains: digits || q } },
      { postalCode: { contains: digits || q } },
      // Sepetteki ürün adına göre arama ("masa" → masa siparişleri)
      { items: { some: { productName: { contains: q, mode: "insensitive" } } } },
      { items: { some: { productCode: { contains: q, mode: "insensitive" } } } },
      { adminNote: { contains: q, mode: "insensitive" } },
      { customerNote: { contains: q, mode: "insensitive" } },
    ];
    if (digits.length >= 3) {
      or.push({ phoneNormalized: { contains: digits } });
    }
    where.OR = or;
  }

  return where;
}

function orderByFor(sort: SortValue): Prisma.OrderOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "total_desc":
      return { total: "desc" };
    case "total_asc":
      return { total: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

function buildUrl(
  base: string,
  filters: Filters,
  overrides: Partial<Filters> = {},
): string {
  const merged: Filters = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (merged.status) params.set("status", merged.status);
  if (merged.q) params.set("q", merged.q);
  if (merged.type) params.set("type", merged.type);
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.min !== undefined) params.set("min", merged.min);
  if (merged.max !== undefined) params.set("max", merged.max);
  if (merged.sort !== "newest") params.set("sort", merged.sort);
  const qs = params.toString();
  return `${base}${qs ? `?${qs}` : ""}`;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const rawParams = await searchParams;
  const filters = parseFilters(rawParams);
  const page = Math.max(1, Number(rawParams.page) || 1);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: buildWhere(filters),
      orderBy: orderByFor(filters.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where: buildWhere(filters) }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasActiveFilters = Boolean(
    filters.status ||
      filters.q ||
      filters.type ||
      filters.from ||
      filters.to ||
      filters.min !== undefined ||
      filters.max !== undefined ||
      filters.sort !== "newest",
  );

  function buildPageUrl(targetPage: number): string {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.q) params.set("q", filters.q);
    if (filters.type) params.set("type", filters.type);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.min !== undefined) params.set("min", filters.min);
    if (filters.max !== undefined) params.set("max", filters.max);
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-medium">Siparişler</h1>
        <p className="text-sm text-muted-foreground" role="status">
          {total} sipariş{hasActiveFilters ? " bulundu" : ""}
        </p>
      </div>

      {/* Filtreler */}
      <form action="/admin/orders" method="get" className="mt-4 rounded-md border border-border bg-card p-4">
        {/* Durum çipleri */}
        <fieldset>
          <legend className="sr-only">Durum filtresi</legend>
          <input type="hidden" name="q" value={filters.q} />
          {filters.type && <input type="hidden" name="type" value={filters.type} />}
          {filters.from && <input type="hidden" name="from" value={filters.from} />}
          {filters.to && <input type="hidden" name="to" value={filters.to} />}
          {filters.min !== undefined && <input type="hidden" name="min" value={filters.min} />}
          {filters.max !== undefined && <input type="hidden" name="max" value={filters.max} />}
          {filters.sort !== "newest" && <input type="hidden" name="sort" value={filters.sort} />}
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Tümü" href={buildUrl("/admin/orders", filters, { status: undefined })} active={!filters.status} />
            {ORDER_STATUSES.map((s) => (
              <FilterChip
                key={s}
                label={ORDER_STATUS_LABELS[s]}
                href={buildUrl("/admin/orders", filters, { status: s })}
                active={filters.status === s}
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto_auto]">
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Arama</span>
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder="Sipariş no, müşteri, telefon, ürün…"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Başlangıç tarihi</span>
            <input
              type="date"
              name="from"
              defaultValue={filters.from ?? ""}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Bitiş tarihi</span>
            <input
              type="date"
              name="to"
              defaultValue={filters.to ?? ""}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Min tutar (₺)</span>
            <input
              type="number"
              name="min"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={filters.min ?? ""}
              placeholder="0"
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Maks tutar (₺)</span>
            <input
              type="number"
              name="max"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={filters.max ?? ""}
              placeholder="∞"
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:border-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Fatura türü</span>
            <select
              name="type"
              defaultValue={filters.type ?? ""}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
            >
              <option value="">Tümü</option>
              {INVOICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Sıralama</span>
            <select
              name="sort"
              defaultValue={filters.sort}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Filtrele
            </button>
            {hasActiveFilters && (
              <Link
                href="/admin/orders"
                aria-label="Filtreleri temizle"
                title="Filtreleri temizle"
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </Link>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Arama şunları kapsar: sipariş no, müşteri adı-soyadı, telefon (farklı
          biçimlerde), e-posta, şehir-ilçe-adres, şirket ünvanı, vergi/T.C. no,
          posta kodu, sepetteki ürün adı-kodu ve notlar.
        </p>
      </form>

      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Sipariş No</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Telefon</th>
              <th className="px-4 py-3 font-medium">Toplam</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {hasActiveFilters
                    ? "Bu filtrelere uyan sipariş bulunamadı."
                    : "Henüz sipariş yok."}
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {order.customerFirstName} {order.customerLastName}
                  {order.invoiceType === "CORPORATE" && (
                    <span className="ml-1.5 rounded bg-muted px-1 py-0.5 align-middle text-[10px] text-muted-foreground">
                      Kurumsal
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {order.phoneNormalized}
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  ₺{Number(order.total).toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusInlineSelect
                    orderId={order.id}
                    status={order.status}
                  />
                </td>
                <td className="hidden px-4 py-3 text-right lg:table-cell">
                  <div className="flex items-center justify-end gap-1.5">
                    <a
                      href={whatsappUrl(
                        order.phoneNormalized,
                        `Merhaba,\n\n${order.orderNumber} numaralı siparişiniz hakkında iletişime geçmek istiyoruz.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp'tan müşteriye yaz"
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      aria-label="Sipariş detayı"
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} kayıt — sayfa {page}/{totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildPageUrl(page - 1)} className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-muted">
                Önceki
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildPageUrl(page + 1)} className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-muted">
                Sonraki
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-transparent bg-primary font-medium text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
