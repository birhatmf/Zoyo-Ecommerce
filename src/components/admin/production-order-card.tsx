"use client";

import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

import {
  advanceProductionAction,
  queueForProductionAction,
  regressProductionAction,
  saveProductionNoteAction,
  toggleUpholsteryAction,
} from "@/app/admin/(panel)/orders/production-actions";
import {
  PRODUCTION_STAGE_LABELS,
  PRODUCTION_STAGES,
  productionProgress,
  stageRequiresUpholstery,
} from "@/lib/order-production";
import { formatPrice } from "@/lib/format";
import type { ProductionStage } from "@/generated/prisma/enums";

export type ProductionOrderItem = {
  id: string;
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  productionStage: ProductionStage | null;
  upholsteryDone: boolean;
  productionNote: string | null;
  total: string;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus:border-ring";

// Tek siparişin üretim kartı — Jira/Slack tarzı aşama ilerletme.
export function ProductionOrderCard({ order }: { order: ProductionOrderItem }) {
  const [note, setNote] = useState(order.productionNote ?? "");
  const stage = order.productionStage;
  const progress = productionProgress(stage);
  const requiresUphol = stage ? stageRequiresUpholstery(stage) : false;

  async function run(action: (fd: FormData) => Promise<void>) {
    const fd = new FormData();
    fd.set("orderId", order.id);
    await action(fd);
  }

  async function saveNote() {
    const fd = new FormData();
    fd.set("orderId", order.id);
    fd.set("note", note);
    await saveProductionNoteAction(fd);
  }

  return (
    <div className="rounded-md border border-border bg-card p-4">
      {/* Başlık: müşteri + sipariş no */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {order.customerFirstName} {order.customerLastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.orderNumber} · {formatPrice(order.total)}
          </p>
        </div>
        {!stage && (
          <form
            action={async () => {
              await run(queueForProductionAction);
            }}
          >
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Sıraya Al
            </button>
          </form>
        )}
      </div>

      {stage ? (
        <>
          {/* İlerleme çubuğu */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{PRODUCTION_STAGE_LABELS[stage]}</span>
              <span className="tabular-nums">%{progress}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Aşama adımları */}
          <div className="mt-3 flex flex-wrap gap-1">
            {PRODUCTION_STAGES.map((s, i) => {
              const activeIdx = PRODUCTION_STAGES.indexOf(stage);
              const done = i <= activeIdx;
              return (
                <span
                  key={s}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] transition-colors ${
                    done
                      ? "bg-accent/15 font-medium text-accent"
                      : "bg-muted text-muted-foreground/60"
                  }`}
                  title={PRODUCTION_STAGE_LABELS[s]}
                >
                  {done && <CheckCircle2 className="size-3" />}
                  {PRODUCTION_STAGE_LABELS[s]}
                </span>
              );
            })}
          </div>

          {/* Minder/döşeme checkbox */}
          {requiresUphol && (
            <form
              action={async () => {
                await run(toggleUpholsteryAction);
              }}
              className="mt-3 flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={order.upholsteryDone}
                readOnly
                className="size-4 accent-accent"
              />
              <span className="text-xs text-muted-foreground">
                {order.upholsteryDone
                  ? "Minder / döşeme tamamlandı ✓"
                  : "Minder / döşeme yapıldı mı?"}
              </span>
              <button
                type="submit"
                className="ml-auto text-xs text-accent underline-offset-4 hover:underline"
              >
                {order.upholsteryDone ? "Geri al" : "Tamamlandı işaretle"}
              </button>
            </form>
          )}

          {/* İleri / geri */}
          <div className="mt-3 flex items-center gap-2">
            {stage !== "QUEUED" && (
              <button
                type="button"
                onClick={() => run(regressProductionAction)}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs transition-colors hover:bg-muted"
                aria-label="Önceki aşamaya al"
              >
                <ChevronLeft className="size-3.5" />
                Geri
              </button>
            )}
            {stage !== "SHIPPED" && (
              <button
                type="button"
                onClick={() => run(advanceProductionAction)}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                {PRODUCTION_STAGE_LABELS[PRODUCTION_STAGES[PRODUCTION_STAGES.indexOf(stage) + 1]]}
                <ChevronRight className="size-3.5" />
              </button>
            )}
            {stage === "SHIPPED" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="size-4" />
                Sevk edildi
              </span>
            )}
          </div>

          {/* Üretim notu */}
          <form
            action={async () => {
              await saveNote();
            }}
            className="mt-3 flex gap-2"
          >
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Üretim/sevk notu (örn. kargo no)…"
              className={`${inputClass} flex-1`}
              aria-label="Üretim notu"
            />
            <button
              type="submit"
              className="h-8 shrink-0 rounded-md border border-border px-3 text-xs transition-colors hover:bg-muted"
            >
              Not
            </button>
          </form>
        </>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Üretime alınmamış. &quot;Sıraya Al&quot; ile başlatın.
        </p>
      )}
    </div>
  );
}
