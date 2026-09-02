import { z } from "zod";

// Admin tarafından görsel adresi olarak kabul edilecek URL'ler.
// Göreli (/api/media/...) her zaman kabul; mutlak URL'ler yalnızca env'deki
// allowlist'teki hostname'lerden olabilir.
const ALLOWED_IMAGE_HOSTS = (process.env.ADMIN_IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter((host) => host.length > 0 && host !== "*" && host !== "**");

export const mediaRefSchema = z
  .string()
  .trim()
  .min(1, "Görsel adresi zorunludur")
  .max(2000)
  .refine(
    (value) => {
      if (value.startsWith("/")) return true;
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") return false;
        if (ALLOWED_IMAGE_HOSTS.length === 0) return false;
        return ALLOWED_IMAGE_HOSTS.includes(url.hostname.toLowerCase());
      } catch {
        return false;
      }
    },
    { message: "Görsel adresi geçersiz veya whitelist dışı" },
  );

export function isMediaRefAllowed(value: string): boolean {
  return mediaRefSchema.safeParse(value).success;
}

// Admin tarafından girilen CTA ve link URL'leri için güvenlik doğrulaması.
// `javascript:` ve diğer tehlikeli scheme'leri reddeder; yalnızca göreli
// yollar, http(s), mailto ve tel kabul edilir.
export const safeUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => {
      if (value === "") return true;
      if (value.startsWith("/")) return true;
      if (value.startsWith("#")) return true;
      try {
        const url = new URL(value);
        const protocol = url.protocol.toLowerCase();
        return (
          protocol === "https:" ||
          protocol === "http:" ||
          protocol === "mailto:" ||
          protocol === "tel:"
        );
      } catch {
        return false;
      }
    },
    { message: "Geçersiz veya güvensiz URL (javascript: vb. reddedildi)" },
  );
