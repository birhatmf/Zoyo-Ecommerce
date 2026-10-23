import { Hammer, Ruler, ShieldCheck, Truck } from "lucide-react";

import type { StorefrontTextKey } from "@/lib/storefront-text";

// Hero altındaki güven/avantaj şeridi. Metinler admin panelinden
// (StorefrontText) yönetilir; ikonlar sabittir.
const ITEMS: {
  Icon: typeof Hammer;
  title: StorefrontTextKey;
  description: StorefrontTextKey;
}[] = [
  { Icon: Hammer, title: "homepage.trust1Title", description: "homepage.trust1Desc" },
  { Icon: Ruler, title: "homepage.trust2Title", description: "homepage.trust2Desc" },
  { Icon: Truck, title: "homepage.trust3Title", description: "homepage.trust3Desc" },
  { Icon: ShieldCheck, title: "homepage.trust4Title", description: "homepage.trust4Desc" },
];

export function TrustBar({
  texts,
}: {
  texts: Record<StorefrontTextKey, string>;
}) {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:py-12">
        {ITEMS.map(({ Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-accent"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">{texts[title]}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {texts[description]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
