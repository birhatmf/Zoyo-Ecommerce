import { disableSitePreviewAction } from "@/app/preview-actions";

export function PreviewBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-center text-xs font-medium text-black">
      <span>
        Bakım modu açık — ziyaretçiler bakım sayfasını görüyor. Şu an önizleme
        modundasınız.
      </span>
      <form action={disableSitePreviewAction}>
        <button
          type="submit"
          className="rounded border border-black/30 px-2 py-0.5 transition-colors hover:bg-black/10"
        >
          Önizlemeyi kapat
        </button>
      </form>
    </div>
  );
}
