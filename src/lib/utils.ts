import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * JSON-LD'yi <script> bloğuna güvenle gömmek için kaçışlar:
 * - "</" dizilimi script etiketini erken kapatıp enjeksiyona izin verir
 * - U+2028/U+2029 satır ayırıcıları JS'de geçersizdir
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
