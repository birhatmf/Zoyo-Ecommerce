import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { mapsUrl, telUrl, whatsappUrl } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";

type ContactItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  href?: string | null;
  external?: boolean;
};

export async function ContactSection() {
  const settings = await getSiteSettings();

  const mapHref = mapsUrl(settings.address, settings.mapUrl);

  const items: ContactItem[] = [];

  if (settings.phone) {
    items.push({
      key: "phone",
      label: "Telefon",
      icon: <Phone className="size-5" />,
      value: settings.phone,
      href: telUrl(settings.phone),
    });
  }
  if (settings.whatsapp) {
    items.push({
      key: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="size-5" />,
      value: settings.whatsapp,
      href: whatsappUrl(settings.whatsapp, "Merhaba, bilgi almak istiyorum."),
      external: true,
    });
  }
  if (settings.email) {
    items.push({
      key: "email",
      label: "E-posta",
      icon: <Mail className="size-5" />,
      value: settings.email,
      href: `mailto:${settings.email}`,
    });
  }
  if (settings.address && settings.address !== "-") {
    items.push({
      key: "address",
      label: "Adres",
      icon: <MapPin className="size-5" />,
      value: settings.address,
      href: mapHref,
      external: true,
    });
  }
  if (settings.workingHours) {
    items.push({
      key: "workingHours",
      label: "Çalışma Saatleri",
      icon: <Clock className="size-5" />,
      value: settings.workingHours,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const inner = (
          <>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">{item.label}</span>
              <span className="block break-words text-sm font-medium text-foreground">
                {item.value}
              </span>
            </span>
          </>
        );

        const className =
          "flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors";

        return item.href ? (
          <a
            key={item.key}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className={`${className} hover:bg-muted/50`}
          >
            {inner}
          </a>
        ) : (
          <div key={item.key} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
