import type { Metadata } from "next";

import { deleteMediaAssetAction } from "@/app/admin/(panel)/media/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { listMediaAssets } from "@/lib/storage";

export const metadata: Metadata = { title: "Medya Kütüphanesi" };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminMediaPage() {
  const assets = await listMediaAssets();

  return (
    <div>
      <h1 className="font-heading text-xl font-medium">Medya Kütüphanesi</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Yüklenen görsellerin merkezi kaydı. Referansı olan medya güvenlik gereği
        silinemez.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {assets.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            Henüz medya kaydı yok.
          </p>
        )}
        {assets.map((asset) => {
          const inUse = asset.refCount > 0;
          return (
            <div key={asset.id} className="rounded-md border border-border bg-card p-2">
              <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.fileName}
                  className="size-full object-cover"
                />
              </div>
              <div className="mt-2 px-1 pb-1">
                <p className="truncate text-xs font-medium" title={asset.fileName}>
                  {asset.fileName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatBytes(asset.sizeBytes)} · {asset.mimeType.replace("image/", "")}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      inUse
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {inUse ? `${asset.refCount} referans` : "Kullanılmıyor"}
                  </span>
                  {!inUse && (
                    <ConfirmDeleteButton
                      action={deleteMediaAssetAction}
                      hiddenFields={{ id: asset.id }}
                      entityName={asset.fileName}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
