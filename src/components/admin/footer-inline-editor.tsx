"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Check } from "lucide-react";

import {
  saveFooterGroupAction,
  saveFooterLinkAction,
} from "@/app/admin/(panel)/content/actions";
import {
  saveSettingInlineAction,
  saveStorefrontTextInlineAction,
} from "@/app/admin/(panel)/settings/actions";

type Link = { id: string; label: string; url: string; sortOrder: number };
type Group = { id: string; title: string; sortOrder: number; links: Link[] };

// Footer'ın birebir görünümünü taklit eden canlı düzenleme paneli.
// Her metin contentEditable'dir; odak kaybedilince ilgili action otomatik
// çalışır (storefront'u gerçek zamanlı günceller).
export function FooterInlineEditor({
  groups,
  settings,
  contactHeading,
  siteShortName,
}: {
  groups: Group[];
  settings: Record<string, string>;
  contactHeading: string;
  siteShortName: string;
}) {
  const socials = [
    { key: "instagram", label: "Instagram" },
    { key: "facebook", label: "Facebook" },
    { key: "youtube", label: "YouTube" },
  ] as const;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Canlı Önizleme — metne tıklayıp düzenleyin
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Otomatik kaydedilir
        </span>
      </div>

      <footer className="bg-primary text-primary-foreground">
        <div className="grid gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {/* Marka / açıklama */}
          <div>
            <InlineText
              action={saveSettingInlineAction}
              fieldName="key"
              value={siteShortName}
              hiddenFields={{ key: "siteShortName" }}
              valueField="value"
              className="font-heading text-lg font-medium tracking-[0.18em] uppercase"
            />
            <InlineText
              action={saveSettingInlineAction}
              fieldName="key"
              value={settings.siteDescription ?? ""}
              hiddenFields={{ key: "siteDescription" }}
              valueField="value"
              className="mt-4 block max-w-xs text-sm leading-relaxed text-primary-foreground/70"
              multiline
            />
            {settings.instagram || settings.facebook || settings.youtube ? (
              <div className="mt-6 flex items-center gap-5">
                {socials.map(
                  ({ key }) =>
                    settings[key] && (
                      <InlineText
                        key={key}
                        action={saveSettingInlineAction}
                        fieldName="key"
                        value={settings[key]}
                        hiddenFields={{ key }}
                        valueField="value"
                        className="text-sm text-primary-foreground/70"
                      />
                    ),
                )}
              </div>
            ) : null}
          </div>

          {/* Link grupları */}
          {groups.length > 0 && (
            <div>
              {groups.map((group, index) => (
                <div key={group.id} className={index > 0 ? "mt-8" : undefined}>
                  <InlineText
                    action={saveFooterGroupAction}
                    fieldName="title"
                    value={group.title}
                    hiddenFields={{ id: group.id, sortOrder: String(group.sortOrder) }}
                    className="text-sm font-medium tracking-wide"
                  />
                  <ul className="mt-3 space-y-2.5">
                    {group.links.map((link) => (
                      <li key={link.id}>
                        <InlineText
                          action={saveFooterLinkAction}
                          fieldName="label"
                          value={link.label}
                          hiddenFields={{
                            groupId: group.id,
                            linkId: link.id,
                            url: link.url,
                            sortOrder: String(link.sortOrder),
                          }}
                          className="text-sm text-primary-foreground/70"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* İletişim */}
          <div>
            <InlineText
              action={saveStorefrontTextInlineAction}
              fieldName="key"
              value={contactHeading}
              hiddenFields={{ key: "footer.contactHeading" }}
              valueField="value"
              className="text-sm font-medium tracking-wide"
            />
            <ul className="mt-3 space-y-3 text-sm text-primary-foreground/70">
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <InlineText
                    action={saveSettingInlineAction}
                    fieldName="key"
                    value={settings.address}
                    hiddenFields={{ key: "address" }}
                    valueField="value"
                    className=""
                    multiline
                  />
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0" />
                  <InlineText
                    action={saveSettingInlineAction}
                    fieldName="key"
                    value={settings.phone}
                    hiddenFields={{ key: "phone" }}
                    valueField="value"
                    className=""
                  />
                </li>
              )}
              {settings.whatsapp && (
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="size-4 shrink-0" />
                  <span className="flex items-center gap-1">
                    WhatsApp:
                    <InlineText
                      action={saveSettingInlineAction}
                      fieldName="key"
                      value={settings.whatsapp}
                      hiddenFields={{ key: "whatsapp" }}
                      valueField="value"
                      className=""
                    />
                  </span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0" />
                  <InlineText
                    action={saveSettingInlineAction}
                    fieldName="key"
                    value={settings.email}
                    hiddenFields={{ key: "email" }}
                    valueField="value"
                    className=""
                  />
                </li>
              )}
              {settings.workingHours && (
                <li className="text-primary-foreground/60">
                  <InlineText
                    action={saveSettingInlineAction}
                    fieldName="key"
                    value={settings.workingHours}
                    hiddenFields={{ key: "workingHours" }}
                    valueField="value"
                    className=""
                  />
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <InlineText
            action={saveSettingInlineAction}
            fieldName="key"
            value={settings.footerCopyright ?? ""}
            hiddenFields={{ key: "footerCopyright" }}
            valueField="value"
            className="mx-auto block max-w-6xl px-4 py-5 text-xs text-primary-foreground/50 sm:px-6"
          />
        </div>
      </footer>
    </div>
  );
}

function InlineText({
  action,
  fieldName,
  value,
  hiddenFields = {},
  className = "",
  multiline = false,
  valueField,
}: {
  action: (formData: FormData) => Promise<void>;
  fieldName: string;
  value: string;
  hiddenFields?: Record<string, string>;
  className?: string;
  multiline?: boolean;
  valueField?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  async function handleBlur() {
    const newValue = ref.current?.innerText ?? "";
    if (newValue === value) return;

    setSaving(true);
    setSaved(false);
    const fd = new FormData();
    fd.set(fieldName, hiddenFields[fieldName] ?? newValue);
    if (valueField) fd.set(valueField, newValue);
    for (const [k, v] of Object.entries(hiddenFields)) {
      if (k !== fieldName) fd.set(k, v);
    }

    try {
      await action(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      if (ref.current) ref.current.innerText = value;
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="relative inline-flex items-center gap-1">
      <span
        ref={ref}
        contentEditable={!saving}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={multiline}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
          }
          if (e.key === "Escape") {
            ref.current!.innerText = value;
            (e.currentTarget as HTMLElement).blur();
          }
        }}
        className={`cursor-text rounded-sm outline-none transition-shadow focus:bg-white/10 focus:ring-2 focus:ring-accent/60 ${className} ${saving ? "opacity-50" : ""}`}
      />
      {saved && (
        <Check className="size-3.5 text-emerald-400" aria-label="kaydedildi" />
      )}
    </span>
  );
}
