import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function NotFoundContent() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <p className="font-heading text-6xl leading-none font-medium tracking-tight text-accent sm:text-7xl">
        404
      </p>
      <h1 className="mt-6 font-heading text-2xl font-medium text-balance sm:text-3xl">
        Aradığınız sayfayı bulamadık
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Sayfa taşınmış veya kaldırılmış olabilir. Aşağıdaki bağlantılardan
        koleksiyonumuza göz atabilirsiniz.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Ana Sayfa
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/urunler"
          className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
        >
          Ürünleri Keşfet
        </Link>
      </div>
    </div>
  );
}
