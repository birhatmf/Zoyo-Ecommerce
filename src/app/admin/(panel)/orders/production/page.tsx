import type { Metadata } from "next";
import Link from "next/link";

import { ProductionOrderCard } from "@/components/admin/production-order-card";
import { prisma } from "@/lib/prisma";
import { PRODUCTION_STAGE_LABELS } from "@/lib/order-production";
import type { ProductionStage } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Üretim Takibi" };

type ProductionPageProps = {
  searchParams: Promise<{ stage?: string }>;
};

export default async function AdminProductionPage({ searchParams }: ProductionPageProps) {
  const { stage } = await searchParams;
  const filterStage = PRODUCTION_STAGE_LABELS[stage as ProductionStage]
    ? (stage as ProductionStage)
    : undefined;

  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: ["CANCELLED", "COMPLETED"] },
      ...(filterStage ? { productionStage: filterStage } : {}),
    },
    orderBy: [{ productionStage: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      orderNumber: true,
      customerFirstName: true,
      customerLastName: true,
      productionStage: true,
      upholsteryDone: true,
      productionNote: true,
      total: true,
    },
  });

  // İstatistik: her aşamadaki sipariş sayısı
  const groupCounts = await prisma.order.groupBy({
    by: ["productionStage"],
    _count: true,
    where: { productionStage: { not: null } },
  });
  const stageCounts = new Map(groupCounts.map((g) => [g.productionStage, g._count]));

  const stageChips = (Object.keys(PRODUCTION_STAGE_LABELS) as ProductionStage[]).map(
    (s) => ({
      stage: s,
      label: PRODUCTION_STAGE_LABELS[s],
      count: stageCounts.get(s) ?? 0,
    }),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-medium">Üretim Takibi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atölyedeki siparişleri aşama aşama ilerletin — müşteri adı otomatik
            görünür, minder ve sevk notu burada tutulur.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Siparişler
        </Link>
      </div>

      {/* Aşama filtre çipleri */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders/production"
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            !filterStage
              ? "border-transparent bg-primary font-medium text-primary-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Tümü
        </Link>
        {stageChips.map((chip) => (
          <Link
            key={chip.stage}
            href={`/admin/orders/production?stage=${chip.stage}`}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              filterStage === chip.stage
                ? "border-transparent bg-primary font-medium text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {chip.label} ({chip.count})
          </Link>
        ))}
      </div>

      {/* Üretimdeki sipariş kartları */}
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.length === 0 && (
          <p className="col-span-full rounded-md border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            {filterStage
              ? "Bu aşamada sipariş yok."
              : "Üretimde sipariş yok. Sipariş detayından 'Sıraya Al' ile başlayın veya doğrudan aşağıdan."}
          </p>
        )}
        {orders.map((order) => (
          <ProductionOrderCard
            key={order.id}
            order={{
              id: order.id,
              orderNumber: order.orderNumber,
              customerFirstName: order.customerFirstName,
              customerLastName: order.customerLastName,
              productionStage: order.productionStage,
              upholsteryDone: order.upholsteryDone,
              productionNote: order.productionNote,
              total: order.total.toString(),
            }}
          />
        ))}
      </div>
    </div>
  );
}
