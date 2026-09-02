import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { telUrl, whatsappUrl } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { getStorefrontText } from "@/lib/storefront-text";
import { getFooterLinkGroups } from "@/services/content.service";

const socials = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
] as const;

export async function Footer() {
  const [settings, groups, contactHeading] = await Promise.all([
    getSiteSettings(),
    getFooterLinkGroups(),
    getStorefrontText("footer.contactHeading"),
  ]);

  const siteName = settings.siteName || "Zoyo Mobilya";

  return (
    <footer className="mt-auto border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="font-heading text-lg font-medium tracking-[0.18em] uppercase">
            {settings.footerLogoUrl ? (
              <Image
                src={settings.footerLogoUrl}
                alt={siteName}
                width={120}
                height={32}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            ) : (
              settings.siteShortName || siteName
            )}
          </div>
          {settings.siteDescription && (
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              {settings.siteDescription}
            </p>
          )}
          {settings.instagram || settings.facebook || settings.youtube ? (
            <div className="mt-6 flex items-center gap-5">
              {socials.map(
                ({ key, label }) =>
                  settings[key] && (
                    <a
                      key={key}
                      href={settings[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                    >
                      {label}
                    </a>
                  ),
              )}
            </div>
          ) : null}
        </div>

        {groups.length > 0 && (
          <div>
            {groups.map((group, index) => (
              <div key={group.id} className={index > 0 ? "mt-8" : undefined}>
                <p className="text-sm font-medium tracking-wide">{group.title}</p>
                <ul className="mt-3 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.url}
                        className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="text-sm font-medium tracking-wide">{contactHeading}</p>
          <ul className="mt-3 space-y-3 text-sm text-primary-foreground/70">
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.phone && (
              <li>
                <a href={telUrl(settings.phone)} className="flex items-center gap-2.5 transition-colors hover:text-primary-foreground">
                  <Phone className="size-4 shrink-0" />
                  <span>{settings.phone}</span>
                </a>
              </li>
            )}
            {settings.whatsapp && (
              <li>
                <a
                  href={whatsappUrl(settings.whatsapp, "Merhaba, bilgi almak istiyorum.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition-colors hover:text-primary-foreground"
                >
                  <MessageCircle className="size-4 shrink-0" />
                  <span>WhatsApp: {settings.whatsapp}</span>
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 transition-colors hover:text-primary-foreground">
                  <Mail className="size-4 shrink-0" />
                  <span>{settings.email}</span>
                </a>
              </li>
            )}
            {settings.workingHours && (
              <li className="text-primary-foreground/60">{settings.workingHours}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-primary-foreground/50 sm:px-6">
          {settings.footerCopyright || `© ${new Date().getFullYear()} ${siteName}`}
        </p>
      </div>
    </footer>
  );
}
