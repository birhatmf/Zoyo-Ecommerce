import Image from "next/image";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { telUrl, whatsappUrl } from "@/lib/format";
import type { SiteSettings } from "@/lib/settings";

export function MaintenanceScreen({ settings }: { settings: SiteSettings }) {
  const siteName = settings.siteName || "Pink Home";
  const message =
    settings.maintenanceMessage ||
    "Sitemiz kısa süreliğine bakımda. Kısa süre içinde tekrar hizmetinizdeyiz.";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <meta name="robots" content="noindex" />

      {settings.logoUrl ? (
        <Image
          src={settings.logoUrl}
          alt={siteName}
          width={200}
          height={48}
          className="h-10 w-auto object-contain"
        />
      ) : (
        <span className="font-heading text-lg font-medium tracking-[0.18em] uppercase">
          {settings.siteShortName || siteName}
        </span>
      )}

      <h1 className="mt-6 font-heading text-2xl font-medium">{siteName}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>

      {(settings.phone || settings.whatsapp || settings.email) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {settings.phone && (
            <a
              href={telUrl(settings.phone)}
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Phone className="size-4" />
              {settings.phone}
            </a>
          )}
          {settings.whatsapp && (
            <a
              href={whatsappUrl(settings.whatsapp, "Merhaba, bilgi almak istiyorum.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          )}
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Mail className="size-4" />
              {settings.email}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
