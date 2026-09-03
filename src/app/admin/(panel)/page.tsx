import Link from "next/link";
import {
  Boxes,
  ClipboardList,
  Clock,
  Layers,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import {
  formatDate,
  ORDER_STATUSES,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
} from "@/lib/order";
import type { OrderStatus } from "@/generated/prisma/client";

export const metadata = { title: "Dashboard" };

// Operasyonel durum kartları (PRD §31): yalnızca işletme için anlamlı olanlar
const STATUS_KPI_MAP: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Bekleyen" },
  { status: "APPROVED", label: "Onaylanan" },
  { status: "IN_PRODUCTION", label: "Üretimde" },
  { status: "COMPLETED", label: "Tamamlanan" },
];

export default async function AdminDashboardPage() {
  const [statusGroups, recentOrders, activeProducts, draftProducts, categoryCount] =
    await Promise.all([
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          customerFirstName: true,
          customerLastName: true,
          phoneNormalized: true,
          total: true,
          status: true,
          createdAt: true,
          invoiceType: true,
        },
      }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.product.count({ where: { status: "DRAFT" } }),
      prisma.category.count(),
    ]);

  const statusMap = new Map(statusGroups.map((g) => [g.status, g._count]));
  const totalPending = statusMap.get("PENDING") ?? 0;

  const kpis = STATUS_KPI_MAP.map(({ status, label }) => ({
    label,
    value: String(statusMap.get(status) ?? 0),
    href: `/admin/orders?status=${status}`,
    alert: status === "PENDING" && (statusMap.get(status) ?? 0) > 0,
  }));

  return (
    <div>
      <h1 className="font-heading text-xl font-medium">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {totalPending > 0
          ? `${totalPending} bekleyen sipariş incelemeyi bekliyor.`
          : "Bekleyen sipariş yok."}
      </p>

      {/* Durum kartları */}
      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`group rounded-md border bg-card p-4 transition-colors hover:bg-muted/50 ${
              kpi.alert ? "border-accent/40" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <Clock
                className={`size-4 ${
                  kpi.alert ? "text-accent" : "text-muted-foreground/40"
                }`}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 font-heading text-2xl font-medium tabular-nums">
              {kpi.value}
            </p>
            {kpi.alert && (
              <p className="mt-1 text-xs font-medium text-accent">
                İnceleme gerekiyor
              </p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Son siparişler */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-medium">Son Siparişler</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Tümünü Gör
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-3 font-medium">Sipariş No</th>
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Telefon</th>
                  <th className="px-4 py-3 font-medium">Toplam</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Henüz sipariş yok.
                    </td>
                  </tr>
                )}
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3">
                      {order.customerFirstName} {order.customerLastName}
                      {order.invoiceType === "CORPORATE" && (
                        <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground align-middle">
                          Kurumsal
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {order.phoneNormalized}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${ORDER_STATUS_BADGE_CLASSES[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 whitespace-nowrap text-muted-foreground lg:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Katalog özeti */}
        <section className="self-start rounded-md border border-border bg-card p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-medium">
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
            Katalog Özeti
          </h2>
          <div className="mt-4 space-y-2.5">
            <Link
              href="/admin/products?status=ACTIVE"
              className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2.5 text-sm">
                <Boxes className="size-4 text-muted-foreground" aria-hidden="true" />
                Aktif Ürün
              </span>
              <span className="font-heading text-lg font-medium tabular-nums">{activeProducts}</span>
            </Link>
            <Link
              href="/admin/products?status=DRAFT"
              className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2.5 text-sm">
                <ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />
                Taslak Ürün
              </span>
              <span className="font-heading text-lg font-medium tabular-nums">{draftProducts}</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-2.5 text-sm">
                <Layers className="size-4 text-muted-foreground" aria-hidden="true" />
                Kategori
              </span>
              <span className="font-heading text-lg font-medium tabular-nums">{categoryCount}</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Durum dağılımı */}
      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Durum Dağılımı</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => {
            const count = statusMap.get(status) ?? 0;
            if (count === 0) return null;
            return (
              <Link
                key={status}
                href={`/admin/orders?status=${status}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors hover:opacity-80 ${ORDER_STATUS_BADGE_CLASSES[status]}`}
              >
                {ORDER_STATUS_LABELS[status]}
                <span className="font-medium tabular-nums">{count}</span>
              </Link>
            );
          })}
          {totalPending === 0 &&
            recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">Henüz sipariş yok.</p>
            )}
        </div>
      </section>
    </div>
  );
}
