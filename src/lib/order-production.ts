import type { ProductionStage } from "@/generated/prisma/enums";

// Üretim hattı aşamaları — sipariş lifecycle'ı (atölye takibi).
// Sıralı ilerler; geri almak da mümkündür (yanlış işaretleme durumunda).
export const PRODUCTION_STAGES: ProductionStage[] = [
  "QUEUED",
  "CUTTING",
  "ASSEMBLY",
  "PAINTING",
  "UPHOLSTERY",
  "READY",
  "SHIPPED",
];

export const PRODUCTION_STAGE_LABELS: Record<ProductionStage, string> = {
  QUEUED: "Sıraya Alındı",
  CUTTING: "Kesimi Yapıldı",
  ASSEMBLY: "Montaj Aşamasında",
  PAINTING: "Boya Aşamasında",
  UPHOLSTERY: "Minder / Döşeme",
  READY: "Sevke Hazır",
  SHIPPED: "Sevk Edildi",
};

// UPHOLSTERY aşamasında minder/döşeme kontrolü istenir.
export function stageRequiresUpholstery(stage: ProductionStage): boolean {
  return stage === "UPHOLSTERY";
}

// Bir sonraki aşama (yoksa null = terminal)
export function nextProductionStage(stage: ProductionStage): ProductionStage | null {
  const idx = PRODUCTION_STAGES.indexOf(stage);
  return idx >= 0 && idx < PRODUCTION_STAGES.length - 1
    ? PRODUCTION_STAGES[idx + 1]
    : null;
}

// Bir önceki aşama (yoksa null = başlangıç)
export function prevProductionStage(stage: ProductionStage): ProductionStage | null {
  const idx = PRODUCTION_STAGES.indexOf(stage);
  return idx > 0 ? PRODUCTION_STAGES[idx - 1] : null;
}

// Progress yüzdesi (0-100) — UI çubuğu için
export function productionProgress(stage: ProductionStage | null): number {
  if (!stage) return 0;
  const idx = PRODUCTION_STAGES.indexOf(stage);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / PRODUCTION_STAGES.length) * 100);
}
