import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Layers,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import {
  formatDate,
  ORDER_STATUSES,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
} from "@/lib/order";

export const metadata = { title: "Dashboard" };

// Durum çubukları için renk eşlemesi (badge sınıflarından bağımsız dolgu)
const STATUS_BAR_CLASSES: Record<string, string> = {
  PENDING: "bg-accent",
  APPROVED: "bg-primary/70",
  PAYMENT_PENDING: "bg-primary/50",
  PAID: "bg-primary/70",
  IN_PRODUCTION: "bg-primary/80",
  READY: "bg-primary/60",
  SHIPPED: "bg-primary/90",
  COMPLETED: "bg-emerald-600",
  CANCELLED: "bg-destructive/60",
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = startOfDay(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const start14 = new Date(startOfToday);
  start14.setDate(start14.getDate() - 13);

  const [
    allTime,
    thisMonth,
    today,
    statusGroups,
    recentOrders,
    last14Orders,
    topItems,
    activeProducts,
    draftProducts,
    categoryCount,
  ] = await Promise.all([
    // İptaller ciroya katılmaz
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfToday } },
      _sum: { total: true },
      _count: true,
    }),
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
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: start14 } },
      select: { createdAt: true, total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
  ]);

  // 14 günlük seriyi gün gün doldur
  const dailySeries: { date: Date; revenue: number; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const day = new Date(start14);
    day.setDate(day.getDate() + i);
    dailySeries.push({ date: day, revenue: 0, count: 0 });
  }
  for (const order of last14Orders) {
    const index = Math.floor(
      (startOfDay(order.createdAt).getTime() - start14.getTime()) / 86_400_000,
    );
    if (index >= 0 && index < 14) {
      dailySeries[index].revenue += Number(order.total);
      dailySeries[index].count += 1;
    }
  }
  const maxDailyRevenue = Math.max(...dailySeries.map((d) => d.revenue), 1);

  const statusMap = new Map(statusGroups.map((g) => [g.status, g._count]));
  const totalOrders = allTime._count || 0;
  const pendingCount = statusMap.get("PENDING") ?? 0;

  const kpis = [
    {
      label: "Toplam Ciro",
      value: formatPrice(allTime._sum.total ?? 0),
      sub: `${totalOrders} sipariş`,
      href: "/admin/orders",
      icon: CircleDollarSign,
    },
    {
      label: "Bu Ay",
      value: formatPrice(thisMonth._sum.total ?? 0),
      sub: `${thisMonth._count} sipariş`,
      href: "/admin/orders",
      icon: CalendarDays,
    },
    {
      label: "Bugün",
      value: formatPrice(today._sum.total ?? 0),
      sub: `${today._count} sipariş`,
      href: "/admin/orders",
      icon: ArrowUpRight,
    },
    {
      label: "Bekleyen Sipariş",
      value: String(pendingCount),
      sub:
        pendingCount > 0
          ? "İnceleme gerekiyor"
          : "Bekleyen sipariş yok",
      href: "/admin/orders?status=PENDING",
      icon: Clock,
      alert: pendingCount > 0,
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-xl font-medium">Dashboard</h1>

      {/* KPI kartları */}
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
              <kpi.icon
                className={`size-4 ${kpi.alert ? "text-accent" : "text-muted-foreground/60"}`}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 font-heading text-2xl font-medium whitespace-nowrap">
              {kpi.value}
            </p>
            <p
              className={`mt-1 text-xs ${
                kpi.alert ? "font-medium text-accent" : "text-muted-foreground"
              }`}
            >
              {kpi.sub}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Son 14 gün grafiği */}
        <section className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Son 14 Gün — Ciro</h2>
            <p className="text-xs text-muted-foreground">
              Günlük toplam (iptaller hariç)
            </p>
          </div>
          <div className="mt-5 flex h-44 items-end gap-1.5 sm:gap-2">
            {dailySeries.map((day) => {
              const heightPct = Math.max(
                (day.revenue / maxDailyRevenue) * 100,
                day.count > 0 ? 4 : 2,
              );
              const isToday =
                startOfDay(day.date).getTime() === startOfToday.getTime();
              return (
                <div
                  key={day.date.toISOString()}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                  title={`${day.date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} — ${day.count} sipariş, ${formatPrice(day.revenue)}`}
                >
                  <span className="text-[10px] font-medium tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {day.count > 0 ? formatPrice(day.revenue) : ""}
                  </span>
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      isToday
                        ? "bg-accent"
                        : day.count > 0
                          ? "bg-primary/75 hover:bg-primary"
                          : "bg-border"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-[10px] tabular-nums ${
                      isToday ? "font-medium text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center sm:text-left">
            <div>
              <dt className="text-xs text-muted-foreground">14 Günlük Ciro</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums">
                {formatPrice(dailySeries.reduce((s, d) => s + d.revenue, 0))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">14 Günlük Sipariş</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums">
                {dailySeries.reduce((s, d) => s + d.count, 0)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Günlük Ortalama</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums">
                {formatPrice(
                  dailySeries.reduce((s, d) => s + d.revenue, 0) / 14,
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* Sağ kolon: durum dağılımı */}
        <section className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Durum Dağılımı</h2>
          <ul className="mt-4 space-y-3">
            {ORDER_STATUSES.map((status) => {
              const count = statusMap.get(status) ?? 0;
              const pct =
                totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <li key={status}>
                  <Link
                    href={`/admin/orders?status=${status}`}
                    className="group block"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                        {ORDER_STATUS_LABELS[status]}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {count} · %{pct}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${STATUS_BAR_CLASSES[status]}`}
                        style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Envanter özeti */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center">
            <Link href="/admin/products" className="group px-1">
              <Boxes className="mx-auto size-4 text-muted-foreground/60" aria-hidden="true" />
              <p className="mt-1 font-heading text-lg font-medium">{activeProducts}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">Aktif Ürün</p>
            </Link>
            <Link href="/admin/products" className="group px-1">
              <ClipboardList className="mx-auto size-4 text-muted-foreground/60" aria-hidden="true" />
              <p className="mt-1 font-heading text-lg font-medium">{draftProducts}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">Taslak</p>
            </Link>
            <Link href="/admin/categories" className="group px-1">
              <Layers className="mx-auto size-4 text-muted-foreground/60" aria-hidden="true" />
              <p className="mt-1 font-heading text-lg font-medium">{categoryCount}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">Kategori</p>
            </Link>
          </div>
        </section>
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

        {/* Çok satanlar */}
        <section className="self-start rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Çok Satanlar</h2>
            <Link
              href="/admin/products"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Ürünlere git"
            >
              <ArrowRight className="size-4" />
            </Link>
          </div>
          {topItems.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Henüz satış verisi yok.
            </p>
          ) : (
            <ol className="mt-4 space-y-3">
              {topItems.map((item, i) => (
                <li key={item.productName} className="flex items-start gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {item._sum.quantity} adet ·{" "}
                      {formatPrice(item._sum.totalPrice ?? 0)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
